import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.sub) });
      const { role } = userObj;
      if (role === 'admin') {
        const { query } = req;
        const { userId } = query;
        const doc = await db
          .collection('annotations')
          .find({ 'creator.id': userId })
          .toArray();
        res.status(200).json({ found: JSON.parse(JSON.stringify(doc)) });
      } else res.status(403).end('Unauthorized');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
