import nc from 'next-connect';
import jwt from 'next-auth/jwt';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const jwtTok = await jwt.getToken({ req, secret });
      if (jwtTok && jwtTok.exp > 0) {
        const { token } = req.query;
        await req.db
          .collection('inviteTokens')
          .findOne(
            {
              token,
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
