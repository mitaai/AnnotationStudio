import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  const projection = {
    text: 0,
  };
  if (method === 'POST') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      if (req.body.userId || req.body.groupIds) {
        const { page, perPage } = req.body;
        const { db } = await connectToDatabase();
        const condition = req.body.userId
          ? { owner: req.body.userId }
          : { groups: { $in: req.body.groupIds }, state: { $not: { $eq: 'draft' } } };
        let arr;
        let count;
        if (req.body.limit) {
          arr = await db
            .collection('documents')
            .find(condition, { projection, sort: [['_id', -1]] })
            .limit(req.body.limit)
            .toArray();
        } else if (page && perPage) {
          arr = await db
            .collection('documents')
            .find(condition, { projection })
            .sort({ createdAt: -1 })
            .skip(page > 0 ? ((page - 1) * perPage) : 0)
            .limit(parseInt(perPage, 10))
            .toArray();
          count = await db.collection('documents').countDocuments(condition);
        } else {
          arr = await db
            .collection('documents')
            .find(condition, { projection })
            .toArray();
        }
        res.status(200).json({ documents: arr, count });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
