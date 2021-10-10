import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
        const { query, perPage, page, sort = {} } = req.body;
        const r = query ? new RegExp(`\.\*${query}\.\*`, 'g') : new RegExp(`\.\*`, 'g');
        const { db } = await connectToDatabase();
        const arr = await db
            .collection('users')
            .find({ $or: [
                {
                    "name": r,
                },
                {
                    "email": r,
                },
            ]})
            .sort(sort)
            .skip(page > 0 ? ((page - 1) * perPage) : 0)
            .limit(parseInt(perPage, 10))
            .toArray();
        res.status(200).json({ users: arr });
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
