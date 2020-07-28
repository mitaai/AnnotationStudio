import nc from 'next-connect';
import jwt from 'next-auth/jwt';
import { ObjectID } from 'mongodb';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      await req.db
        .collection('users')
        .findOne(
          { _id: ObjectID(req.query.id) },
          (err, doc) => {
            if (doc) {
              const {
                name, firstName, lastName, affiliation,
              } = doc;
              if (err) throw err;
              res.status(200).json({
                name, firstName, lastName, affiliation,
              });
            } else {
              res.status(404).json({ error: '404 Not Found' });
            }
          },
        );
    },
  )
  .patch(
    async (req, res) => {
      const token = await jwt.getJwt({ req, secret });
      if (token && token.exp > 0) {
        const groupToPush = req.body.addedGroup
          ? { groups: req.body.addedGroup }
          : {};
        await req.db
          .collection('users')
          .findOneAndUpdate(
            { _id: ObjectID(req.query.id) },
            {
              $push: { ...groupToPush },
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
