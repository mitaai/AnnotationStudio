import { ObjectID } from 'mongodb';
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
        .findOne({ _id: ObjectID(token.id) });
      const userGroups = (userObj.groups && userObj.groups.length > 0)
        ? userObj.groups.map((group) => group.id)
        : [];
      const doc = await db
        .collection('documents')
        .find({
          _id: ObjectID(req.query.id),
          $or: [{ groups: { $in: userGroups } }, { owner: token.id }],
        })
        .toArray();
      if (doc[0]) {
        const document = doc[0];
        const {
          title,
          slug,
          owner,
          groups,
          resourceType,
          authors,
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
          editors,
          volume,
          issue,
          pageNumbers,
          publication,
          series,
          sesiesNumber,
          notes,
        } = document;
        res.status(200).json({
          title,
          slug,
          owner,
          groups,
          resourceType,
          authors,
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
          editors,
          volume,
          issue,
          pageNumbers,
          publication,
          series,
          sesiesNumber,
          notes,
        });
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'PATCH') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        title,
        groups,
        slug,
        resourceType,
        authors,
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
        editors,
        volume,
        issue,
        pageNumbers,
        publication,
        series,
        sesiesNumber,
        notes,
      } = req.body;
      const fieldsToSet = {
        title,
        groups,
        slug,
        resourceType,
        authors,
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
        editors,
        volume,
        issue,
        pageNumbers,
        publication,
        series,
        sesiesNumber,
        notes,
      };
      Object.keys(fieldsToSet).forEach((key) => {
        if (fieldsToSet[key] === undefined) {
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
      const doc = await db
        .collection('documents')
        .findOneAndUpdate(
          {
            _id: ObjectID(req.query.id),
            owner: token.id,
            ...groupById,
          },
          updateMethods,
          {
            returnOriginal: false,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'DELETE') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const doc = await db
        .collection('documents')
        .findOneAndDelete(
          {
            _id: ObjectID(req.query.id),
            owner: token.id,
          },
        );
      res.status(200).json(doc);
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
