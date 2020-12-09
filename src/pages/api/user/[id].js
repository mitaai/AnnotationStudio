import jwt from 'next-auth/jwt';
import { ObjectID } from 'mongodb';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  const token = await jwt.getToken({ req, secret });
  if (method === 'GET') {
    const { db } = await connectToDatabase();
    if (ObjectID.isValid(req.query.id)) {
      let querierRole = 'user';
      if (token && token.exp > 0) {
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        querierRole = userObj.role;
      }
      const doc = await db
        .collection('users')
        .find(
          { _id: ObjectID(req.query.id) },
        )
        .toArray();
      if (doc[0]) {
        const {
          name, firstName, lastName, affiliation, role,
        } = doc[0];
        const groups = doc[0].groups ? doc[0].groups : [];
        if (querierRole === 'admin') {
          const {
            email, emailVerified, createdAt, updatedAt, slug,
          } = doc[0];
          res.status(200).json({
            name,
            firstName,
            lastName,
            affiliation,
            groups,
            role,
            email,
            emailVerified,
            createdAt,
            updatedAt,
            slug,
          });
        } else {
          res.status(200).json({
            name, firstName, lastName, affiliation, groups, role,
          });
        }
      } else res.status(404).end('Not Found');
    } else res.status(404).end('Not Found');
  } else if (method === 'PATCH') {
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const groupToPush = req.body.addedGroup
        ? { groups: req.body.addedGroup }
        : {};
      const groupToPull = req.body.removedGroupId
        ? { groups: { id: req.body.removedGroupId } }
        : {};
      const roleToUpdate = req.body.newRole
        ? { role: req.body.newRole }
        : {};
      let groupById = {};
      let groupToUpdate = {};
      if (req.body.updatedGroupId) {
        groupById = { 'groups.id': req.body.updatedGroupId };
        if (req.body.memberCount) {
          groupToUpdate = {
            'groups.$.memberCount': req.body.memberCount,
          };
        }
        if (req.body.role) {
          groupToUpdate = {
            'groups.$.role': req.body.role,
          };
        }
        if (req.body.groupName) {
          groupToUpdate = {
            'groups.$.name': req.body.groupName,
          };
        }
        if (req.body.ownerName) {
          groupToUpdate = {
            'groups.$.ownerName': req.body.ownerName,
          };
        }
      }
      const updateMethods = {};
      const fieldsToPush = { ...groupToPush };
      if (Object.keys(fieldsToPush).length !== 0) updateMethods.$push = fieldsToPush;
      const fieldsToPull = { ...groupToPull };
      if (Object.keys(fieldsToPull).length !== 0) updateMethods.$pull = fieldsToPull;
      const fieldsToSet = { ...groupToUpdate, ...roleToUpdate };
      if (Object.keys(fieldsToSet).length !== 0) updateMethods.$set = fieldsToSet;
      updateMethods.$currentDate = { updatedAt: true };
      const doc = await db
        .collection('users')
        .findOneAndUpdate(
          {
            _id: ObjectID(req.query.id),
            ...groupById,
          },
          updateMethods,
          {
            returnOriginal: false,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'DELETE') {
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      if (ObjectID.isValid(req.query.id)) {
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        const { role } = userObj;
        if (role === 'admin') {
          const doc = await db
            .collection('users')
            .findOneAndDelete({ _id: ObjectID(req.query.id) })
            .then(() => db
              .collection('accounts')
              .findOneAndDelete({ userId: ObjectID(req.query.id) }));
          res.status(200).json(doc);
        } else res.status(403).end('Unauthorized');
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
