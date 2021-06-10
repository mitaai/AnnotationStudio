import jwt from 'next-auth/jwt';
import { ObjectID } from 'mongodb';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'DELETE') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        id,
      } = req.query;
      const { db } = await connectToDatabase();
      const doc = await db
        .collection('ideaspaces')
        .remove({ _id: ObjectID(id) }, true);
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
