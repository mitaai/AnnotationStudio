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
      // console.log('variable info: ', db);
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.sub) });
      const userGroups = (userObj.groups && userObj.groups.length > 0)
        ? userObj.groups.map((group) => group.id)
        : [];
      const findCondition = {
        $and: [
          { slug: req.query.slug },
        ],
      };
      if (userObj.role !== 'admin') findCondition.$and.push({ $or: [{ groups: { $in: userGroups } }, { owner: token.sub }] });
      const doc = await db
        .collection('documents')
        .find(findCondition)
        .toArray();
      if (doc[0]) {
        const document = doc[0];
        const {
          version,
          _id,
          title,
          owner,
          groups,
          resourceType,
          contributors,
          publisher,
          publicationDate,
          publicationTitle,
          websiteTitle,
          newspaperTitle,
          magazineTitle,
          journalTitle,
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
          textAnalysisId,
        } = document;
        res.status(200).json({
          version,
          id: _id,
          title,
          owner,
          groups,
          resourceType,
          contributors,
          publisher,
          publicationDate,
          publicationTitle,
          websiteTitle,
          newspaperTitle,
          magazineTitle,
          journalTitle,
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
          textAnalysisId,
        });
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default handler;
