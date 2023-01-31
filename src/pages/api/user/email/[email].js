import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const user = await db
        .collection('users')
        .find({
          $text: {
            $search: `"${req.query.email}"`,
          },
        }).toArray();
      if (user[0]) {
        const doc = user[0];
        // eslint-disable-next-line no-underscore-dangle
        const id = doc._id;
        const { name, groups, email } = doc;
        res.status(200).json({
          id, name, groups, email,
        });
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
