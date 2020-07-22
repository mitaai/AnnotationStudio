/* eslint-disable max-len */
import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;
const fakeUserID = ObjectID('7b639ae33efb36eaf6447c55');

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const token = await jwt.getJwt({ req, secret });
      if (token && token.exp > 0) {
        await req.db
          .collection('groups')
          .findOne(
            {
              _id: ObjectID(req.query.id),
              'members.id': token.user.id,
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
        )
  .patch(
    async (req, res) => {
      const token = await jwt.getJwt({ req, secret });
      if (token && token.exp > 0) {
        const memberQuery = (process.env.NODE_ENV === 'development')
          ? [{ 'members.id': ObjectID(token.user.id) }, { 'members.id': fakeUserID }]
          : [{ 'members.id': ObjectID(token.user.id) }];
        const nameToUpdate = req.body.name
          ? { name: req.body.name }
          : {};
        let documentToUpdate = {};
        let documentByID = {};
        if (req.body.updatedDocument) {
          documentByID = { 'documents.id': req.body.updatedDocument.id };
          documentToUpdate = {
            'documents.$.slug': req.body.updatedDocument.slug,
            'documents.$.name': req.body.updatedDocument.name,
          };
        }
        const memberToPush = req.body.addedUser
          ? { members: req.body.addedUser }
          : {};
        const documentToPush = req.body.addedDoc
          ? { documents: req.body.addedDoc }
          : {};
        const memberToPull = req.body.removedUserID
          ? { 'members.id': ObjectID(req.body.removedUserID) }
          : {};
        const documentToPull = req.body.removedDocumentID
          ? { 'documents.id': ObjectID(req.body.removedDocumentID) }
          : {};
        await req.db
          .collection('groups')
          .findOneAndUpdate(
            {
              _id: ObjectID(req.query.id),
              $or: memberQuery,
              ...documentByID,
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
