import nc from 'next-connect';
import middleware from '../../../middlewares/middleware';


const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      await req.db
        .collection('users')
        .findOne(
          { email: req.query.email },
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
              res.status(404).json({});
            }
          },
        );
    },
  );

export default handler;
