import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const { role } = userObj;
      if (role === 'admin') {
        const condition = {
          $or: [
            { 'target.document.text': { $not: undefined } },
            { 'target.document.textSlate': { $not: undefined } },
          ],
        };
        const arr = await db
          .collection('annotations')
          .updateMany(
            condition,
            {
              $set: {
                'target.document.text': undefined,
                'target.document.textSlate': undefined,
              },
              // $currentDate: { modified: true },
            },
          );
        if (Array.isArray(arr)) res.status(200).json({ count: arr.length });
        else res.status(404).end('Request Unsuccessful');
      } else res.status(404).end('Must be an admin to make this request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
