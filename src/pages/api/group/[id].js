import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        await req.db
          .collection('groups')
          .findOne(
            {
              _id: ObjectID(req.query.id),
              'members.id': token.id,
            },
            (err, doc) => {
              if (doc) {
                const {
                  name,
                  members,
                  documents,
                  inviteToken,
                  createdAt,
                  updatedAt,
                } = doc;
                if (err) throw err;
                res.status(200).json({
                  name,
                  members,
                  documents,
                  inviteToken,
                  createdAt,
                  updatedAt,
                });
              } else {
                res.status(404).json({ error: '404 Not Found' });
              }
            },
          );
      }
    },
  )
  .patch(
    async (req, res) => {
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

        await req.db
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
            (err, doc) => {
              if (err) throw err;
              res.status(200).json(doc);
            },
          );
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  )
  .delete(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        await req.db
          .collection('groups')
          .findOneAndDelete(
            {
              _id: ObjectID(req.query.id),
              members: { $elemMatch: { id: token.id, role: 'owner' } },
            },
            (err, doc) => {
              if (err) throw err;
              res.status(200).json(doc);
            },
          );
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  );

export default handler;
