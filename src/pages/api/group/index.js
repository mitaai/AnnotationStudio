import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .post(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const { name } = req.body;
        const members = [{
          id: ObjectID(token.id),
          name: token.name,
          email: token.email,
          role: 'owner',
        }];
        const documents = [{}];
        await req.db
          .collection('groups')
          .insertOne(
            { name, members, documents },
            (err, doc) => {
              if (err) throw err;
              res.status(200).json(doc);
            },
          );
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  );

export default handler;
