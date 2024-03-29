import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.sub) });
      const userGroups = (userObj.groups && userObj.groups.length > 0)
        ? userObj.groups.map((group) => group.id)
        : [];
      const findCondition = {
          $and: [
            { _id: ObjectID(req.query.id) },
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
          title,
          slug,
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
          fileObj,
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
          title,
          slug,
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
          fileObj,
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
  } else if (method === 'PATCH') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        version,
        title,
        groups,
        slug,
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
        volume,
        issue,
        pageNumbers,
        publication,
        series,
        seriesNumber,
        notes,
        textAnalysisId,
      } = req.body;
      const fieldsToSet = {
        version,
        title,
        groups,
        slug,
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
        volume,
        issue,
        pageNumbers,
        publication,
        series,
        seriesNumber,
        notes,
        textAnalysisId,
      };
      Object.keys(fieldsToSet).forEach((key) => {
        if (fieldsToSet[key] === undefined || fieldsToSet[key] === '') {
          delete fieldsToSet[key];
        }
      });
      const updateMethods = {};
      let groupById = {};

      if (req.body.removedGroupId) {
        groupById = { groups: req.body.removedGroupId };
        const groupToPull = { groups: req.body.removedGroupId };
        const fieldsToPull = { ...groupToPull };
        if (Object.keys(fieldsToPull).length !== 0) updateMethods.$pull = fieldsToPull;
      }

      const groupToPush = req.body.addedGroup
        ? { groups: req.body.addedGroup }
        : {};
      const fieldsToPush = { ...groupToPush };
      if (Object.keys(fieldsToPush).length !== 0) updateMethods.$push = fieldsToPush;

      if (Object.keys(fieldsToSet).length !== 0) updateMethods.$set = fieldsToSet;
      updateMethods.$currentDate = { updatedAt: true };

      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.sub) });
      const findCondition = {
        $and: [
          { _id: ObjectID(req.query.id) }
        ],
      };
      if (userObj.role !== 'admin') findCondition.$and.push({ owner: token.sub });
      const doc = await db
        .collection('documents')
        .findOneAndUpdate(
          {
            $and: [
              findCondition,
              groupById,
            ],
          },
          updateMethods,
          {
            returnOriginal: false,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'DELETE') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.sub) });
      const findCondition = {
        $and: [
          { _id: ObjectID(req.query.id) },
        ],
      };
      if (userObj.role !== 'admin') findCondition.$and.push({ owner: token.sub });
      const doc = await db
        .collection('documents')
        .findOneAndDelete(findCondition);
      // eslint-disable-next-line no-underscore-dangle
      if (doc && doc.value && doc.value._id) {
        const { _id, fileObj } = doc.value;
        console.log('fileObj', fileObj);
        await db
          .collection('annotations')
          .deleteMany({
            'target.document.id': _id.toString(),
          });
      }
      res.status(200).json(doc);
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
