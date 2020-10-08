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
      const doc = await db
        .collection('groups')
        .find({
          _id: ObjectID(req.query.id),
          'members.id': token.id,
        })
        .toArray();
      if (doc[0]) {
        const group = doc[0];
        const {
          name,
          members,
          documents,
          inviteToken,
          createdAt,
          updatedAt,
        } = group;
        res.status(200).json({
          name,
          members,
          documents,
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
      let documentToUpdate = {};
      let documentById = {};
      if (req.body.updatedDocument) {
        documentById = { 'documents.id': req.body.updatedDocument.id };
        documentToUpdate = {
          'documents.$.slug': req.body.updatedDocument.slug,
          'documents.$.name': req.body.updatedDocument.name,
        };
      }
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
      const documentToPush = req.body.addedDocument
        ? { documents: req.body.addedDocument }
        : {};
      const memberToPull = req.body.removedUserId
        ? { members: { id: req.body.removedUserId } }
        : {};
      const documentToPull = req.body.removedDocumentId
        ? { documents: { id: req.body.removedDocumentId } }
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
        ...documentToUpdate,
        ...memberToChangeRole,
        ...memberToChangeName,
        ...inviteTokenToUpdate,
      };
      if (Object.keys(fieldsToSet).length !== 0) updateMethods.$set = fieldsToSet;
      const fieldsToUnset = {
        ...inviteTokenToUnset,
      };
      if (Object.keys(fieldsToUnset).length !== 0) updateMethods.$unset = fieldsToUnset;
      const fieldsToPush = { ...memberToPush, ...documentToPush };
      if (Object.keys(fieldsToPush).length !== 0) updateMethods.$push = fieldsToPush;
      const fieldsToPull = { ...memberToPull, ...documentToPull };
      if (Object.keys(fieldsToPull).length !== 0) updateMethods.$pull = fieldsToPull;
      updateMethods.$currentDate = { updatedAt: true };

      const { db } = await connectToDatabase();
      const doc = await db
        .collection('groups')
        .findOneAndUpdate(
          {
            _id: ObjectID(req.query.id),
            ...documentById,
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
      const doc = await db
        .collection('groups')
        .findOneAndDelete(
          {
            _id: ObjectID(req.query.id),
            members: { $elemMatch: { id: token.id, role: 'owner' } },
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
