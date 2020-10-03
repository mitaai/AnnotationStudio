import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import GetUserByID from '../../../utils/userUtil';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;


const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const userObj = await GetUserByID(token.id);
        const userGroups = (userObj.groups && userObj.groups.length > 0)
          ? userObj.groups.map((group) => group.id)
          : [];
        await req.db
          .collection('documents')
          .findOne(
            {
              _id: ObjectID(req.query.id),
              $or: [{ groups: { $in: userGroups } }, { owner: token.id }],
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
        const updateMethods = {};
        let groupById = {};

        if (req.body.removedGroupId) {
          groupById = { groups: req.body.removedGroupId };
          const groupToPull = { groups: req.body.removedGroupId };
          const fieldsToPull = { ...groupToPull };
          if (Object.keys(fieldsToPull).length !== 0) updateMethods.$pull = fieldsToPull;
        }

        const groupToPush = req.body.addedGroup
          ? { groups: req.body.addedGroup }
          : {};
        const fieldsToPush = { ...groupToPush };
        if (Object.keys(fieldsToPush).length !== 0) updateMethods.$push = fieldsToPush;

        if (Object.keys(fieldsToSet).length !== 0) updateMethods.$set = fieldsToSet;
        updateMethods.$currentDate = { updatedAt: true };

        await req.db
          .collection('documents')
          .findOneAndUpdate(
            {
              _id: ObjectID(req.query.id),
              owner: token.id,
              ...groupById,
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
          .collection('documents')
          .findOneAndDelete(
            {
              _id: ObjectID(req.query.id),
              owner: token.id,
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
