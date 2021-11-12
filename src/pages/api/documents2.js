import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  const projection = {
    text: 0,
  };
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        page, perPage, userId, groupIds, noDrafts, skip, sort = { createdAt: -1 },
      } = req.body;
      if (userId || groupIds) {
        const { db } = await connectToDatabase();
        /*
          there are two cases: required groupIds
          user passes a userId and a groupIds, meaning that they want their documents from a
          specific document user passes groupIds, meaning that they want shared documents from a
          specific group
        */

        const state = { $not: { $eq: 'draft' } };
        const condition = {};
        if (userId) {
          condition.owner = userId;
        }

        if (groupIds) {
          if (groupIds.length === 0) {
            // the uscondition.groupser wants documents from the psuedo group Private
            condition.groups = [];
          } else {
            condition.groups = { $in: req.body.groupIds };
          }
        }

        if (userId === undefined || noDrafts) {
          // we are looking at shared documents meaning that we don't want to see drafts
          condition.state = state;
        }

        let skp = 0;
        if (skip !== undefined) {
          skp = skip;
        } else if (page && perPage) {
          skp = page > 0 ? ((page - 1) * perPage) : 0;
        }

        let arr;
        let count = 0;
        if (perPage && (page !== undefined || skip !== undefined)) {
          arr = await db
            .collection('documents')
            .find(condition, { projection })
            .sort(sort)
            .skip(skp)
            .limit(parseInt(perPage, 10))
            .toArray();
          count = await db.collection('documents').countDocuments(condition);
        } else {
          arr = await db
            .collection('documents')
            .find(condition, { projection })
            .toArray();

          count = arr.length;
        }

        res.status(200).json({
          documents: arr,
          count,
        });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
