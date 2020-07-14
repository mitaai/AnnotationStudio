import nc from 'next-connect';
import middleware from '../../../../middlewares/middleware';


const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      await req.db
        .collection('users')
        .findOne(
          { slug: req.query.slug },
          (err, doc) => {
            if (doc) {
              const {
                name, firstName, lastName, affiliation, email,
              } = doc;
              if (err) throw err;
              res.status(200).json({
                name, firstName, lastName, affiliation, email,
              });
            } else {
              res.status(404).json({});
            }
          },
        );
    },
  );

export default handler;
