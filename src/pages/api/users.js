import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const token = await jwt.getToken({ req, secret });
  const { method } = req;
  if (method === 'PATCH') {
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const doc = await db
        .collection('users')
        .findOneAndUpdate(
          { email: token.email },
          {
            $set: {
              name: req.body.name,
              email: req.body.email,
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
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
