import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
// import { calculatePacketSizes } from '../../utils/annotationUtil';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const {
      deleteReferenceToText,
    } = req.query;
    if (deleteReferenceToText !== undefined) {
      const token = await getToken({ req, secret });
      if (token && token.exp > 0) {
        const { db } = await connectToDatabase();
        const userObj = await db
          .collection('users')
          .findOne({ _id: ObjectID(token.sub) });
        const { role } = userObj;
        if (role === 'admin') {
          const condition = {
            $or: [
              { 'target.document.text': { $ne: undefined } },
              { 'target.document.textSlate': { $ne: undefined } },
            ],
          };
          const arr = await db
            .collection('annotations')
            .updateMany(
              condition,
              {
                $set: {
                  'target.document.text': undefined,
                  'target.document.textSlate': undefined,
                },
                // $currentDate: { modified: true },
              },
            );
          res.status(200).json({ arr });
        } else res.status(404).end('Must be an admin to make this request');
      } else res.status(403).end('Invalid or expired token');
    } else res.status(403).end('Badly Formatted Request');
  } else if (method === 'POST') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        userId,
        groupIds,
        page,
        perPage,
        // range,
      } = req.body;
      if (userId) {
        if (userId === token.sub) {
          const { db } = await connectToDatabase();
          const condition = {
            $or: [
              {
                'permissions.private': false,
                $or: [
                  { 'permissions.sharedTo': { $in: [userId] } },
                  { 'permissions.groups': { $in: groupIds } },
                ],
              },
              {
                'creator.id': userId,
              },
            ],
          };
          let arr = [];
          if (page && perPage) {
            arr = await db
              .collection('annotations')
              .find(condition)
              .sort({ createdAt: -1 })
              .skip(page > 0 ? ((page - 1) * perPage) : 0)
              .limit(parseInt(perPage, 10))
              .toArray();

            res.status(200).json({
              annotations: arr,
            });
          } else {
            arr = await db
              .collection('annotations')
              .find(condition)
              .sort({ createdAt: -1 })
              .toArray();

            res.status(200).json({
              annotations: arr.slice(0, perPage),
              count: arr.length,
            });
          }
        } else res.status(403).end('Unauthorized');
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
