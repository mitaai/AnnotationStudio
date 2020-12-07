import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const userGroups = (userObj.groups && userObj.groups.length > 0)
        ? userObj.groups.map((group) => group.id)
        : [];
      const findCondition = { slug: req.query.slug };
      if (userObj.role !== 'admin') findCondition.$or = [{ groups: { $in: userGroups } }, { owner: token.id }];
      const doc = await db
        .collection('documents')
        .find(findCondition)
        .toArray();
      if (doc[0]) {
        const document = doc[0];
        const {
          _id,
          title,
          owner,
          groups,
          resourceType,
          contributors,
          publisher,
          publicationDate,
          bookTitle,
          edition,
          url,
          accessed,
          rightsStatus,
          location,
          state,
          text,
          createdAt,
          updatedAt,
          uploadContentType,
          volume,
          issue,
          pageNumbers,
          publication,
          series,
          seriesNumber,
          notes,
        } = document;
        res.status(200).json({
          id: _id,
          title,
          owner,
          groups,
          resourceType,
          contributors,
          publisher,
          publicationDate,
          bookTitle,
          edition,
          url,
          accessed,
          rightsStatus,
          location,
          state,
          text,
          createdAt,
          updatedAt,
          uploadContentType,
          volume,
          issue,
          pageNumbers,
          publication,
          series,
          seriesNumber,
          notes,
        });
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
