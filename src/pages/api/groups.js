import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { groupIds } = req.body;
      if (groupIds) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.id) });
        const groupObjectIds = groupIds.map((id) => ObjectID(id));
        const findCondition = { _id: { $in: groupObjectIds } };
        if (userObj.role !== 'admin') findCondition['members.id'] = token.id;
        const projection = { _id: 1, name: 1 };
        const arr = await db
          .collection('groups')
          .find(findCondition, {
            projection,
            sort: [['_id', -1]],
          })
          .toArray();
        res.status(200).json({ groups: arr });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
