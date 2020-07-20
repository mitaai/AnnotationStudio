import nc from 'next-connect';
import jwt from 'next-auth/jwt';
import middleware from '../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .patch(
    async (req, res) => {
      const token = await jwt.getJwt({ req, secret });
      if (token && token.exp > 0) {
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
                slug: req.body.slug,
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
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  );

export default handler;
