import nc from 'next-connect';
import jwt from 'next-auth/jwt';
import cryptoRandomString from 'crypto-random-string';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .post(
    async (req, res) => {
      const jwtTok = await jwt.getToken({ req, secret });
      if (jwtTok && jwtTok.exp > 0) {
        const createdAt = new Date(Date.now());
        const updatedAt = createdAt;
        const token = cryptoRandomString({ length: 32, type: 'hex' });
        const { group } = req.body;
        await req.db
          .collection('inviteTokens')
          .insertOne(
            {
              token, group, createdAt, updatedAt,
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
