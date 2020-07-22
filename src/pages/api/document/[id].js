import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const token = await jwt.getJwt({ req, secret });
      if (token && token.exp > 0) {
        await req.db
          .collection('documents')
          .findOne(
            {
              _id: ObjectID(req.query.id),
              'groups.members.id': ObjectID(token.user.id),
            },
            (err, doc) => {
              if (doc) {
                const {
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
                  notes,
                } = doc;
                if (err) throw err;
                res.status(200).json({
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
