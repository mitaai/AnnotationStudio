import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'PATCH') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const findCondition = { _id: ObjectID(req.query.id) };
      const updateMethods = { $set: { archive: true } };
      const doc = await db
        .collection('groups')
        .findOneAndUpdate(
          findCondition,
          updateMethods,
          {
            returnOriginal: false,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
