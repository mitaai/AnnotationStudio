import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    if (req.body.body && req.body.permissions && req.body.target) {
      if (req.body.target.document && req.body.target.document.slug) {
        const token = await jwt.getToken({ req, secret });
        if (token && token.exp > 0) {
          const created = new Date(Date.now());
          const modified = created;
          const type = 'Annotation';
          const {
            creator, body, permissions, target,
          } = req.body;
          if (!body.type) body.type = 'TextualBody';
          if (!body.format) body.format = 'text/html';
          if (!creator.id) creator.id = token.id;
          if (!creator.name) creator.name = token.name;
          if (!creator.email) creator.email = token.email;
          const { db } = await connectToDatabase();
          const doc = await db
            .collection('annotations')
            .insertOne(
              {
                type,
                creator,
                permissions,
                created,
                modified,
                body,
                target,
              },
            );
          res.status(200).json(doc);
        } else res.status(403).end('Invalid or expired token');
      } else res.status(400).end('Invalid request body: target is missing document or slug');
    } else res.status(400).end('Invalid request body: missing body, permissions, or target');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
