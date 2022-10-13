import jwt from 'next-auth/jwt';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const {
      firstName,
      lastName,
      email,
      affiliation,
    } = req.body || {};
    if (firstName && lastName && email && affiliation) {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const createdAt = new Date(Date.now());
        const updatedAt = createdAt;
        const name = `${firstName} ${lastName}`;
        const slug = `${slugify(name)}-${cryptoRandomString({ length: 5, type: 'hex' })}`;
        const doc = await db
          .collection('users')
          .insertOne({
            name,
            firstName,
            lastName,
            affiliation,
            email,
            emailVerified: createdAt,
            image: undefined,
            slug,
            role: 'user',
            createdAt,
            updatedAt,
            groups: undefined,
          });

        res.status(200).json(doc);
      } else res.status(403).end('Invalid or expired token');
    } else res.status(400).end('Invalid request body: missing body holding new user info');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
