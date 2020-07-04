import nc from 'next-connect';
import middleware from '../../middlewares/middleware';

const handler = nc()
  .use(middleware)
  .post(
    async (req) => {
      await req.db
        .collection('users')
        .findOneAndUpdate(
          { email: req.body.email },
          {
            $set: {
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              affiliation: req.body.affiliation,
            },
            $currentDate: {
              updatedAt: true,
            },
          },
        )
        .then(({ ops }) => ops[0]);
    },
  );

export default handler;
