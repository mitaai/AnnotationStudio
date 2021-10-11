import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const token = await jwt.getToken({ req, secret });
  const { method } = req;
  if (method === 'PATCH') {
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const { role } = userObj;
      if (role === 'admin' || req.body.email === token.email) {
        const doc = await db
          .collection('users')
          .findOneAndUpdate(
            { email: req.body.email },
            {
              $set: {
                name: req.body.name,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                affiliation: req.body.affiliation,
                slug: req.body.slug,
              },
              $currentDate: {
                updatedAt: true,
              },
            },
            {
              returnOriginal: false,
            },
          );
        res.status(200).json(doc);
      } else res.status(403).end('Unauthorized');
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { userIds } = req.body;
      if (userIds) {
        const { db } = await connectToDatabase();
        const userObjectIds = userIds.map((id) => ObjectID(id));
        const findCondition = { _id: { $in: userObjectIds } };
        const arr = await db
          .collection('users')
          .find(findCondition)
          .toArray();
        res.status(200).json({ users: arr });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
