import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import middleware from '../../../middlewares/middleware';

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      await req.db
        .collection('groups')
        .findOne(
          { _id: ObjectID(req.query.id) },
          (err, doc) => {
            if (doc) {
              const {
                name,
                members,
                documents,
                createdAt,
                updatedAt,
              } = doc;
              if (err) throw err;
              res.status(200).json({
                name,
                members,
                documents,
                createdAt,
                updatedAt,
              });
            } else {
              res.status(404).json({});
            }
          },
        );
    },
  );

export default handler;
