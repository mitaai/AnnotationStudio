import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { slug } = req.query;
      if (slug) {
        const { db } = await connectToDatabase();
        const arr = await db
          .collection('annotations')
          .find({
            'target.document.slug': slug,
          })
          .toArray();
        res.status(200).json({ annotations: arr });
      } else res.status(400).end('Bad request: missing document slug');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
