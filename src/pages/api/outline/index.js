import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const dateCreated = new Date(Date.now());
      const {
        name,
        document,
      } = req.body;

      if (name === undefined) {
        res.status(400).end('Missing outline name');
      } else {
        const { db } = await connectToDatabase();
        const doc = await db
          .collection('outlines')
          .insertOne(
            {
              owner: token.id,
              createdAt: dateCreated,
              updatedAt: dateCreated,
              name,
              document,
            },
          );
        res.status(200).json(doc);
      }
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const condition = { owner: token.id };
      const arr = await db
        .collection('outlines')
        .find(condition)
        .toArray();
      res.status(200).json({ outlines: arr });
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
