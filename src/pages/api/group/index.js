import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    if (req.body.name) {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const createdAt = new Date(Date.now());
        const updatedAt = createdAt;
        const { name, ownerName } = req.body;
        const members = [{
          id: token.id,
          name: ownerName || token.name,
          email: token.email,
          role: 'owner',
        }];
        const documents = [{}];
        const { db } = await connectToDatabase();
        const doc = await db
          .collection('groups')
          .insertOne(
            {
              name, members, documents, createdAt, updatedAt,
            },
          );
        res.status(200).json(doc);
      } else res.status(403).end('Invalid or expired token');
    } else res.status(400).end('Invalid request body');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
