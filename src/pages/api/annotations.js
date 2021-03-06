import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        slug, userId, limit, page, perPage,
      } = req.query;
      let groupIds = req.query['groupIds[]'];
      if (groupIds && !Array.isArray(groupIds)) {
        groupIds = [req.query['groupIds[]']];
      }
      if (slug) {
        const { db } = await connectToDatabase();
        const arr = await db
          .collection('annotations')
          .find({
            'target.document.slug': slug,
          })
          .toArray();
        res.status(200).json({ annotations: arr });
      } else if (userId) {
        if (userId === token.id) {
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
        } else res.status(403).end('Unauthorized');
      } else if (groupIds) {
        const { db } = await connectToDatabase();
        const condition = {
          'permissions.private': false,
          $or: [
            { 'permissions.sharedTo': { $in: [token.id] } },
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
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        const { role } = userObj;
        let findCondition = {
          'target.document.slug': documentToUpdate.slug,
          'target.document.owner.id': token.id,
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
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        const { role } = userObj;
        if (role !== 'admin' && creatorToUpdate.id !== token.id) {
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
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        const { role } = userObj;
        if (role !== 'admin' && oldCreatorId !== token.id) {
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
