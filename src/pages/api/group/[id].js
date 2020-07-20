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
          .collection('groups')
          .findOne(
            { _id: ObjectID(req.query.id) },
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
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  );

export default handler;
