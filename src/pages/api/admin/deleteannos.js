import { ObjectId } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectId(token.id) });
      const { role } = userObj;
      if (role === 'admin') {
        const { query } = req;
        const { page, perPage } = query;
        const doc = await db
          .collection('annotations')
          .find({}, { projection: { 'target.document.id': 1 } })
          .skip(page > 0 ? ((page - 1) * perPage) : 0)
          .limit(parseInt(perPage, 10))
          .toArray();
        const annos = doc.map((entry) => ({
          // eslint-disable-next-line no-underscore-dangle
          _id: entry._id,
          docId: ObjectId(entry.target.document.id),
        }));
        const annosCheckDoc = await Promise.all(annos.map(async (anno) => {
          let deleteMe = false;
          const foundDoc = await db
            .collection('documents')
            .findOne({ _id: ObjectId(anno.docId) });
          if (foundDoc === null) {
            deleteMe = true;
          }
          return { ...anno, deleteMe };
        }));
        const annosToDelete = annosCheckDoc.filter((anno) => anno.deleteMe === true);
        res.status(200).json({ found: JSON.parse(JSON.stringify(annosToDelete)) });
      } else res.status(403).end('Unauthorized');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
