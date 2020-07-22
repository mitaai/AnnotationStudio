import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import middleware from '../../../middlewares/middleware';

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
              if (err) throw err;
              res.status(200).json({
                name, firstName, lastName, affiliation,
              });
            } else {
              res.status(404).json({ error: '404 Not Found' });
            }
          },
        );
    },
  );

export default handler;
