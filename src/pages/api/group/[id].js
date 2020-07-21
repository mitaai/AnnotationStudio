import nc from 'next-connect';
import { getObjectId } from 'mongo-seeding';
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
            {
              _id: ObjectID(req.query.id),
              members: token.user.id,
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
      const token = await jwt.getJwt({ req, secret });
      if (token && token.exp > 0) {
        const memberQuery = (process.env.NODE_ENV === 'development')
          ? [{ members: ObjectID(token.user.id) }, { members: getObjectId('FakeUserReplaceMe') }]
          : [{ members: ObjectID(token.user.id) }];
        const fieldsToSet = req.body.name ? { name: req.body.name } : {};
        const membersToPush = req.body.addedUserId
          ? { members: ObjectID(req.body.addedUserId) }
          : {};
        const membersToPull = req.body.removedUserId
          ? { members: ObjectID(req.body.removedUserId) }
          : {};
        await req.db
          .collection('groups')
          .findOneAndUpdate(
            {
              _id: ObjectID(req.query.id),
              $or: memberQuery,
            },
            {
              $set: fieldsToSet,
              $push: membersToPush,
              $pull: membersToPull,
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
