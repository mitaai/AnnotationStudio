import nc from 'next-connect';
import jwt from 'next-auth/jwt';
import { ObjectID } from 'mongodb';
import middleware from '../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      await req.db
        .collection('users')
        .findOne(
          { _id: ObjectID(req.query.id) },
          (err, doc) => {
            if (doc) {
              const {
                name, firstName, lastName, affiliation,
              } = doc;
              const groups = doc.groups ? doc.groups : [];
              if (err) throw err;
              res.status(200).json({
                name, firstName, lastName, affiliation, groups,
              });
            } else {
              res.status(404).json({ error: '404 Not Found' });
            }
          },
        );
    },
  )
  .patch(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        const groupToPush = req.body.addedGroup
          ? { groups: req.body.addedGroup }
          : {};
        const groupToPull = req.body.removedGroupId
          ? { groups: { id: req.body.removedGroupId } }
          : {};
        let groupById;
        let groupToUpdate;
        if (req.body.updatedGroupId) {
          groupById = { 'groups.id': req.body.updatedGroupId };
          if (req.body.memberCount) {
            groupToUpdate = {
              'groups.$.memberCount': req.body.memberCount,
            };
          }
        }
        const updateMethods = {};
        const fieldsToPush = { ...groupToPush };
        if (Object.keys(fieldsToPush).length !== 0) updateMethods.$push = fieldsToPush;
        const fieldsToPull = { ...groupToPull };
        if (Object.keys(fieldsToPull).length !== 0) updateMethods.$pull = fieldsToPull;
        const fieldsToSet = { ...groupToUpdate };
        if (Object.keys(fieldsToSet).length !== 0) updateMethods.$set = fieldsToSet;
        updateMethods.$currentDate = { updatedAt: true };
        await req.db
          .collection('users')
          .findOneAndUpdate(
            {
              _id: ObjectID(req.query.id),
              ...groupById,
            },
            updateMethods,
            {
              returnOriginal: false,
            },
            (err, doc) => {
              if (err) throw err;
              // console.log(doc);
              res.status(200).json(doc);
            },
          );
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  );

export default handler;
