import nc from 'next-connect';
import middleware from '../../middlewares/middleware';

const handler = nc()
  .use(middleware)
  .patch(
    async (req, res) => {
      await req.db
        .collection('users')
        .findOneAndUpdate(
          { email: req.body.email },
          {
            $set: {
              name: req.body.name,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              affiliation: req.body.affiliation,
            },
            $currentDate: {
              updatedAt: true,
            },
          },
          {
            returnOriginal: false,
          },
          (err, doc) => {
            if (err) throw err;
            res.status(200).json(doc);
          },
        );
    },
  );

export default handler;
