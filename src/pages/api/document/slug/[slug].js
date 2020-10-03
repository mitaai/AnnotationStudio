import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import middleware from '../../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const userObj = await req.db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        const userGroups = (userObj.groups && userObj.groups.length > 0)
          ? userObj.groups.map((group) => group.id)
          : [];
        await req.db
          .collection('documents')
          .findOne(
            {
              slug: req.query.slug,
              $or: [{ groups: { $in: userGroups } }, { owner: token.id }],
            },
            (err, doc) => {
              if (doc) {
                const {
                  _id,
                  title,
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
                  id: _id,
                  title,
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
  );

export default handler;
