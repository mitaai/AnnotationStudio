import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;
const fakeUserId = ObjectID('7b639ae33efb36eaf6447c55');

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
              'members.id': ObjectID(token.id),
            },
            (err, doc) => {
              if (doc) {
                const {
                  name,
                  members,
                  documents,
                  createdAt,
                  updatedAt,
                } = doc;
                if (err) throw err;
                res.status(200).json({
                  name,
                  members,
                  documents,
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
        const memberQuery = (process.env.NODE_ENV === 'development')
          ? [{ 'members.id': ObjectID(token.id) }, { 'members.id': fakeUserId }]
          : [{ 'members.id': ObjectID(token.id) }];
        const nameToUpdate = req.body.name
          ? { name: req.body.name }
          : {};
        let documentToUpdate = {};
        let documentById = {};
        if (req.body.updatedDocument) {
          documentById = { 'documents.id': ObjectID(req.body.updatedDocument.id) };
          documentToUpdate = {
            'documents.$.slug': req.body.updatedDocument.slug,
            'documents.$.name': req.body.updatedDocument.name,
          };
        }
        const memberToPush = req.body.addedUser
          ? { members: req.body.addedUser }
          : {};
        const documentToPush = req.body.addedDocument
          ? { documents: req.body.addedDocument }
          : {};
        const memberToPull = req.body.removedUserId
          ? { 'members.id': ObjectID(req.body.removedUserId) }
          : {};
        const documentToPull = req.body.removedDocumentId
          ? { 'documents.id': ObjectID(req.body.removedDocumentId) }
          : {};
        await req.db
          .collection('groups')
          .findOneAndUpdate(
            {
              _id: ObjectID(req.query.id),
              $or: memberQuery,
              ...documentById,
            },
            {
              $set: { ...nameToUpdate, ...documentToUpdate },
              $push: { ...memberToPush, ...documentToPush },
              $pull: { ...memberToPull, ...documentToPull },
              $currentDate: {
                updatedAt: true,
              },
            },
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
  );

export default handler;
