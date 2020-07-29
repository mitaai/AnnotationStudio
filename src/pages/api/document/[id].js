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
          .collection('documents')
          .findOne(
            {
              _id: ObjectID(req.query.id),
              $or: [{ 'groups.members.id': ObjectID(token.id) }, { owner: ObjectID(token.id) }],
            },
            (err, doc) => {
              if (doc) {
                const {
                  title,
                  slug,
                  owner,
                  groups,
                  resourceType,
                  authors,
                  publisher,
                  publicationDate,
                  bookTitle,
                  edition,
                  url,
                  accessed,
                  rightsStatus,
                  location,
                  state,
                  text,
                  createdAt,
                  updatedAt,
                  uploadContentType,
                  editors,
                  volume,
                  issue,
                  pageNumbers,
                  publication,
                  series,
                  sesiesNumber,
                  notes,
                } = doc;
                if (err) throw err;
                res.status(200).json({
                  title,
                  slug,
                  owner,
                  groups,
                  resourceType,
                  authors,
                  publisher,
                  publicationDate,
                  bookTitle,
                  edition,
                  url,
                  accessed,
                  rightsStatus,
                  location,
                  state,
                  text,
                  createdAt,
                  updatedAt,
                  uploadContentType,
                  editors,
                  volume,
                  issue,
                  pageNumbers,
                  publication,
                  series,
                  sesiesNumber,
                  notes,
                });
              } else {
                res.status(404).json({ error: '404 Not Found' });
              }
            },
          );
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  )
  .patch(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const {
          title,
          slug,
          resourceType,
          authors,
          publisher,
          publicationDate,
          bookTitle,
          edition,
          url,
          accessed,
          rightsStatus,
          location,
          state,
          text,
          editors,
          volume,
          issue,
          pageNumbers,
          publication,
          series,
          sesiesNumber,
          notes,
        } = req.body;
        const fieldsToSet = {
          title,
          slug,
          resourceType,
          authors,
          publisher,
          publicationDate,
          bookTitle,
          edition,
          url,
          accessed,
          rightsStatus,
          location,
          state,
          text,
          editors,
          volume,
          issue,
          pageNumbers,
          publication,
          series,
          sesiesNumber,
          notes,
        };
        Object.keys(fieldsToSet).forEach((key) => {
          if (fieldsToSet[key] === undefined) {
            delete fieldsToSet[key];
          }
        });
        const groupToPush = req.body.addedGroup
          ? { groups: req.body.addedGroup }
          : {};
        const groupToPull = req.body.removedGroupId
          ? { 'groups.id': ObjectID(req.body.removedGroupId) }
          : {};
        let groupById = {};
        let groupFieldsToSet = {};
        let memberToPush = {};
        let memberToPull = {};
        if (req.body.updatedGroup) {
          groupById = { 'groups.id': ObjectID(req.body.updatedGroup.id) };
          if (req.body.updatedGroup.name) {
            groupFieldsToSet = { 'groups.$.name': req.body.updatedGroup.name };
          }
          if (req.body.addedUser) {
            memberToPush = { 'groups.$.members': req.body.addedUser };
          }
          if (req.body.removedUserId) {
            memberToPull = { 'groups.$.members.id': ObjectID(req.body.removedUserId) };
          }
        }
        await req.db
          .collection('documents')
          .findOneAndUpdate(
            {
              _id: ObjectID(req.query.id),
              owner: ObjectID(token.id),
              ...groupById,
            },
            {
              $set: { ...fieldsToSet, ...groupFieldsToSet },
              $push: { ...memberToPush, ...groupToPush },
              $pull: { ...memberToPull, ...groupToPull },
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
