import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        userId,
      } = req.query;
      let groupIds = req.query['groupIds[]'];
      if (groupIds && !Array.isArray(groupIds)) {
        groupIds = [req.query['groupIds[]']];
      }
      if (userId) {
        if (userId === token.id) {
          const { db } = await connectToDatabase();
          const condition = {
            $or: [
              {
                'permissions.private': false,
                $or: [
                  { 'permissions.sharedTo': { $in: [userId] } },
                  { 'permissions.groups': { $in: groupIds } },
                ],
              },
              {
                'creator.id': userId,
              },
            ],
          };

          const arr = await db
            .collection('annotations')
            .find(condition)
            .toArray();
          res.status(200).json({ annotations: arr });
        } else res.status(403).end('Unauthorized');
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
