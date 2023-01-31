import { getToken } from 'next-auth/jwt';
import cryptoRandomString from 'crypto-random-string';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    if (req.body.group) {
      const jwtTok = await getToken({ req, secret });
      if (jwtTok && jwtTok.exp > 0) {
        const createdAt = new Date(Date.now());
        const updatedAt = createdAt;
        const token = cryptoRandomString({ length: 32, type: 'hex' });
        const { group } = req.body;
        const { db } = await connectToDatabase();
        const doc = await db
          .collection('inviteTokens')
          .insertOne(
            {
              token, group, createdAt, updatedAt,
            },
          );
        res.status(200).json(doc);
      } else res.status(403).end('Invalid or expired token');
    } else res.status(400).end('Invalid request body');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
