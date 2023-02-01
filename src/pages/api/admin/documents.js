import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  const projection = {
    text: 0,
  };
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
        const {
          sort, order, page, perPage,
        } = query;
        let direction = -1;
        if (order) {
          if (order === 'asc') direction = 1;
          else if (order === 'desc') direction = -1;
        }
        const sortBy = sort ? { [sort]: direction } : { _id: direction };
        const doc = await db
          .collection('documents')
          .find({}, { projection })
          .sort(sortBy)
          .skip(page > 0 ? ((page - 1) * perPage) : 0)
          .limit(parseInt(perPage, 10))
          .toArray();
        const count = await db.collection('documents').countDocuments({});
        res.status(200).json({ documents: JSON.parse(JSON.stringify(doc)), count });
      } else res.status(403).end('Unauthorized');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default handler;
