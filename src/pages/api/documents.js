import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      if (req.body.userId || req.body.groupIds) {
        const { db } = await connectToDatabase();
        const condition = req.body.userId
          ? { owner: req.body.userId }
          : { groups: { $in: req.body.groupIds } };
        let arr;
        if (req.body.limit) {
          arr = await db
            .collection('documents')
            .find(condition)
            .limit(req.body.limit)
            .toArray();
        } else {
          arr = await db
            .collection('documents')
            .find(condition)
            .toArray();
        }
        if (arr.length > 0) res.status(200).json({ documents: arr });
        else res.status(404).end('File Not Found');
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
