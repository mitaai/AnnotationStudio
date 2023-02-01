import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { byPermissionFilter, MAX_NUMBER_OF_ANNOTATIONS_REQUESTED } from '../../utils/annotationUtil';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      const {
        slug,
        limit,
        page,
        countByPermissions,
        userId,
        userEmail,
        selectedPermissions,
        perPage = MAX_NUMBER_OF_ANNOTATIONS_REQUESTED,
      } = req.body;

      let groupIds = req.query['groupIds[]'];
      if (groupIds && !Array.isArray(groupIds)) {
        groupIds = [req.query['groupIds[]']];
      }
      if (slug) {
        const { db } = await connectToDatabase();
        let arr = [];
        const condition = {
          'target.document.slug': slug,
        };

        const p = page || 1;
        const skip = p < 0 ? 0 : (p - 1) * perPage;

        if (countByPermissions && selectedPermissions) {
          // the user is loading annotations for a specific document with specific permissions for
          // the dashboard for the first time / refreshing
          arr = await db
            .collection('annotations')
            .find(condition)
            .sort({ modified: -1 })
            .toArray();

          const cbp = {
            mine: arr
              .filter(({ creator: { email }, permissions }) => byPermissionFilter({
                email, permissions, filter: 'mine', userEmail,
              })),
            shared: arr
              .filter(({ creator: { email }, permissions }) => byPermissionFilter({
                email, permissions, filter: 'shared',
              })),
            'shared-with-me': arr
              .filter(({ creator: { email }, permissions }) => byPermissionFilter({
                email, permissions, filter: 'shared-with-me', userId,
              })),
          };

          const annotationsByPermissions = {
            mine: cbp.mine.slice(skip, perPage),
            shared: cbp.shared.slice(skip, perPage),
            'shared-with-me': cbp['shared-with-me'].slice(skip, perPage),
          };

          res.status(200).json({
            annotations: annotationsByPermissions[selectedPermissions],
            annotationsByPermissions,
            count: arr.length,
            countByPermissions: {
              mine: cbp.mine.length,
              shared: cbp.shared.length,
              'shared-with-me': cbp['shared-with-me'].length,
            },
          });
        } else if (selectedPermissions) {
          // The user is trying to load more annotations for a specific document with specific
          // permissions for the dashboard

          if (selectedPermissions === 'mine') {
            condition['creator.email'] = userEmail;
          } else if (selectedPermissions === 'shared') {
            condition['permissions.private'] = { $eq: false };
            condition['permissions.sharedTo'] = { $eq: undefined };
          } else if (selectedPermissions === 'shared-with-me') {
            condition['permissions.sharedTo'] = userId;
          }

          arr = await db
            .collection('annotations')
            .find(condition)
            .sort({ modified: -1 })
            .toArray();

          const annotationsByPermissions = {
            mine: [],
            shared: [],
            'shared-with-me': [],
          };

          annotationsByPermissions[selectedPermissions] = arr.slice(skip, skip + perPage);

          res.status(200).json({
            annotations: annotationsByPermissions[selectedPermissions],
            annotationsByPermissions,
            countByPermissions: {
              [selectedPermissions]: arr.length,
            },
            count: arr.length,
          });
        } else {
          // user is trying to load annotations by slug for document view. Needs the first packet
          // of annotations and the count of total annotations so that it knows how many more
          // packets of data to request

          arr = await db
            .collection('annotations')
            .find(condition)
            .sort({ modified: -1 })
            .toArray();

          res.status(200).json({
            annotations: arr.slice(skip, skip + perPage),
            count: arr.length,
          });
        }
      } else if (userId) {
        if (userId === token.sub) {
          const { db } = await connectToDatabase();
          const condition = { 'creator.id': userId };
          if (limit) {
            const arr = await db
              .collection('annotations')
              .find(condition, {
                sort: [['_id', -1]],
              })
              .limit(parseInt(limit, 10))
              .toArray();
            res.status(200).json({ annotations: arr });
          } else if (page && perPage) {
            const arr = await db
              .collection('annotations')
              .find(condition)
              .sort({ createdAt: -1 })
              .skip(page > 0 ? ((page - 1) * perPage) : 0)
              .limit(parseInt(perPage, 10))
              .toArray();
            const count = await db.collection('annotations').countDocuments(condition);
            res.status(200).json({ annotations: arr, count });
          } else {
            const arr = await db
              .collection('annotations')
              .find(condition)
              .toArray();
            res.status(200).json({ annotations: arr });
          }
        } else res.status(403).end('Unauthorized');
      } else if (groupIds) {
        const { db } = await connectToDatabase();
        const condition = {
          'permissions.private': false,
          $or: [
            { 'permissions.sharedTo': { $in: [token] } },
            { 'permissions.groups': { $in: groupIds } },
          ],
        };
        if (limit) {
          const arr = await db
            .collection('annotations')
            .find(condition, {
              sort: [['_id', -1]],
            })
            .limit(parseInt(limit, 10))
            .toArray();
          res.status(200).json({ annotations: arr });
        } else if (page && perPage) {
          const arr = await db
            .collection('annotations')
            .find(condition, {
              sort: [['_id', -1]],
            })
            .skip(page > 0 ? ((page - 1) * perPage) : 0)
            .limit(parseInt(perPage, 10))
            .toArray();
          const count = await db.collection('annotations').countDocuments(condition);
          res.status(200).json({ annotations: arr, count });
        } else {
          const arr = await db
            .collection('annotations')
            .find(condition)
            .toArray();
          res.status(200).json({ annotations: arr });
        }
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'PATCH') {
    if (req.body.mode === 'documentMetadata' && req.body.documentToUpdate) {
      const { documentToUpdate } = req.body;
      documentToUpdate.text = undefined;
      documentToUpdate.textSlate = undefined;
      const token = await getToken({ req, secret, raw: false });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.sub) });
        const { role } = userObj;
        let findCondition = {
          'target.document.slug': documentToUpdate.slug,
          'target.document.owner.id': token.sub,
        };
        if (role === 'admin') {
          findCondition = { 'target.document.slug': documentToUpdate.slug };
        }
        if (!documentToUpdate.format) documentToUpdate.format = 'text/html';
        const arr = await db
          .collection('annotations')
          .updateMany(
            findCondition,
            {
              $set: {
                'target.document': documentToUpdate,
              },
              $currentDate: { modified: true },
            },
          );
        if (arr !== null) res.status(200).json({ annotations: arr });
        else res.status(404).end('Not found');
      } else res.status(403).end('Invalid or expired token');
    } else if (req.body.mode === 'userProfile' && req.body.creatorToUpdate) {
      const { creatorToUpdate } = req.body;
      const token = await getToken({ req, secret, raw: false });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.sub) });
        const { role } = userObj;
        if (role !== 'admin' && creatorToUpdate.id !== token) {
          res.status(403).end('Not authorized');
        } else {
          const findCondition = { 'creator.id': creatorToUpdate.id };
          const arr = await db
            .collection('annotations')
            .updateMany(
              findCondition,
              {
                $set: {
                  'creator.name': creatorToUpdate.name,
                  'creator.email': creatorToUpdate.email,
                },
                $currentDate: { modified: true },
              },
            );
          if (arr !== null) res.status(200).json({ annotations: arr });
          else res.status(404).end('Not found');
        }
      } else res.status(403).end('Invalid or expired token');
    } else if (req.body.mode === 'reassign' && req.body.oldCreatorId && req.body.newCreator) {
      const { oldCreatorId, newCreator } = req.body;
      const token = await getToken({ req, secret, raw: false });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.sub) });
        const { role } = userObj;
        if (role !== 'admin' && oldCreatorId !== token) {
          res.status(403).end('Not authorized');
        } else {
          const findCondition = { 'creator.id': oldCreatorId };
          const arr = await db
            .collection('annotations')
            .updateMany(
              findCondition,
              {
                $set: {
                  'creator.id': newCreator.id,
                  'creator.name': newCreator.name,
                  'creator.email': newCreator.email,
                },
                $currentDate: { modified: true },
              },
            );
          if (arr !== null) res.status(200).json({ annotations: arr });
          else res.status(404).end('Not found');
        }
      } else res.status(403).end('Invalid or expired token');
    } else res.status(400).end('Bad request body');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
