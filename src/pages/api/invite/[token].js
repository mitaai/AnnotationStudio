import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;


const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const { token } = req.query;
    const { db } = await connectToDatabase();
    const doc = await db
      .collection('inviteTokens')
      .find(
        {
          token,
        },
      ).toArray();
    if (doc[0]) res.status(200).json(doc[0]);
    else res.status(404).end('Not Found');
  } else if (method === 'DELETE') {
    const jwtTok = await getToken({ req, secret });
    if (jwtTok && jwtTok.exp > 0) {
      const { token } = req.query;
      const { db } = await connectToDatabase();
      const doc = await db
        .collection('inviteTokens')
        .findOneAndDelete(
          {
            token,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
