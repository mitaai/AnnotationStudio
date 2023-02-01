import { connectToDatabase } from '../../../../utils/dbUtil';
import { ObjectId } from 'mongodb';
const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const { id } = req.query;
    const { db } = await connectToDatabase();
    const condition = { _id: ObjectId(id) };
    const doc = await db
      .collection('inviteTokens')
      .findOne(condition);
    
    res.status(200).json(doc);
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;