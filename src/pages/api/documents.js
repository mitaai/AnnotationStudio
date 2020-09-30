import jwt from 'next-auth/jwt';
import nc from 'next-connect';
import middleware from '../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .post(async (req, res) => {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      if (req.body.userId || req.body.groupIds) {
        const condition = req.body.userId
          ? { owner: req.body.userId }
          : { groups: { $in: req.body.groupIds } };
        const arr = await req.db
          .collection('documents')
          .find(condition)
          .toArray();
        if (arr.length > 0) res.status(200).json({ documents: arr });
        else res.status(404).json({ error: '404 File Not Found' });
      } else res.status(400).json({ error: '400 Bad request' });
    } else res.status(403).json({ error: '403 Invalid or expired token' });
  });

export default handler;
