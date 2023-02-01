import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const doc = await db
        .collection('users')
        .find(
          { slug: req.query.slug },
        )
        .toArray();
      if (doc[0]) {
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.sub) });
        const { role } = userObj;
        const user = doc[0];
        if (role === 'admin' || user.email === token.email) {
          const {
            name, firstName, lastName, affiliation, email,
          } = user;
          res.status(200).json({
            name, firstName, lastName, affiliation, email,
          });
        } else res.status(403).end('Forbidden');
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
