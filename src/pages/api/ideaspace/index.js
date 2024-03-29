import { getToken } from 'next-auth/jwt';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const dateCreated = new Date(Date.now());
      const {
        name,
        annotationIds,
      } = req.body;

      if (name === undefined) {
        res.status(400).end('Missing idea space name');
      } else {
        const { db } = await connectToDatabase();
        const { insertedId } = await db
          .collection('ideaspaces')
          .insertOne(
            {
              owner: token.sub,
              createdAt: dateCreated,
              updatedAt: dateCreated,
              name,
              annotationIds,
            },
          );
          
        const condition = { _id: ObjectId(insertedId) };
        const doc = await db
        .collection('ideaspaces')
        .findOne(condition)

        res.status(200).json(doc);
      }
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'GET') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const condition = { owner: token.sub };
      const arr = await db
        .collection('ideaspaces')
        .find(condition)
        .toArray();
      res.status(200).json({ ideaspaces: arr });
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
