import nc from 'next-connect';
import middleware from '../../../middlewares/middleware';

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const { token } = req.query;
      await req.db
        .collection('inviteTokens')
        .findOne(
          {
            token,
          },
          (err, doc) => {
            if (err) throw err;
            res.status(200).json(doc);
          },
        );
    },
  );

export default handler;
