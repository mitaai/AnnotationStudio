import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const findCondition = { _id: ObjectID(req.query.id) };
      if (userObj.role !== 'admin') findCondition['members.id'] = token.id;
      const doc = await db
        .collection('groups')
        .find(findCondition)
        .toArray();
      if (doc[0]) {
        const group = doc[0];
        const {
          name,
          members,
          inviteToken,
          createdAt,
          updatedAt,
        } = group;
        res.status(200).json({
          name,
          members,
          inviteToken,
          createdAt,
          updatedAt,
        });
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'PATCH') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const nameToUpdate = req.body.name
        ? { name: req.body.name }
        : {};
      let memberToChangeRole = {};
      let memberById = {};
      if (req.body.memberToChangeRoleId) {
        memberById = { 'members.id': req.body.memberToChangeRoleId };
        memberToChangeRole = {
          'members.$.role': req.body.role,
        };
      }
      let memberToChangeName = {};
      if (req.body.memberToChangeNameId) {
        memberById = { 'members.id': req.body.memberToChangeNameId };
        memberToChangeName = {
          'members.$.name': req.body.memberName,
        };
      }
      const memberToPush = req.body.addedUser
        ? { members: req.body.addedUser }
        : {};
      const memberToPull = req.body.removedUserId
        ? { members: { id: req.body.removedUserId } }
        : {};
      const inviteTokenToUpdate = req.body.inviteToken
        ? { inviteToken: req.body.inviteToken }
        : {};

      const inviteTokenToUnset = req.body.tokenToRemove
        ? { inviteToken: req.body.tokenToRemove }
        : {};

      const updateMethods = {};
      const fieldsToSet = {
        ...nameToUpdate,
        ...memberToChangeRole,
        ...memberToChangeName,
        ...inviteTokenToUpdate,
      };
      if (Object.keys(fieldsToSet).length !== 0) updateMethods.$set = fieldsToSet;
      const fieldsToUnset = {
        ...inviteTokenToUnset,
      };
      if (Object.keys(fieldsToUnset).length !== 0) updateMethods.$unset = fieldsToUnset;
      const fieldsToPush = { ...memberToPush };
      if (Object.keys(fieldsToPush).length !== 0) updateMethods.$push = fieldsToPush;
      const fieldsToPull = { ...memberToPull };
      if (Object.keys(fieldsToPull).length !== 0) updateMethods.$pull = fieldsToPull;
      updateMethods.$currentDate = { updatedAt: true };

      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const findCondition = { _id: ObjectID(req.query.id) };
      if (userObj.role !== 'admin') {
        if (req.body.inviteToken) {
          const tokenObj = await db
            .collection('inviteTokens')
            .findOne({ token: req.body.inviteToken });
          if (tokenObj.group !== req.query.id) {
            findCondition['members.id'] = token.id;
          }
        } else {
          findCondition['members.id'] = token.id;
        }
      }
      const doc = await db
        .collection('groups')
        .findOneAndUpdate(
          {
            ...findCondition,
            ...memberById,
          },
          updateMethods,
          {
            returnOriginal: false,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'DELETE') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const findCondition = { _id: ObjectID(req.query.id) };
      if (userObj.role !== 'admin') findCondition.members = { $elemMatch: { id: token.id, role: 'owner' } };
      const doc = await db
        .collection('groups')
        .findOneAndDelete(findCondition);
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
