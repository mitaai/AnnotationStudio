import nc from 'next-connect';
import jwt from 'next-auth/jwt';
import middleware from '../../../../middlewares/middleware';

const secret = process.env.AUTH_SECRET;

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      const token = await jwt.getToken({ req, secret });
      if (token && token.exp > 0) {
        await req.db
          .collection('users')
          .findOne(
            { slug: req.query.slug },
            (err, doc) => {
              if (doc) {
                if (doc.email === token.user.email) {
                  const {
                    name, firstName, lastName, affiliation, email,
                  } = doc;
                  if (err) throw err;
                  res.status(200).json({
                    name, firstName, lastName, affiliation, email,
                  });
                } else res.status(403).json({ error: '403 Forbidden' });
              } else {
                res.status(404).json({ error: '404 Not Found' });
              }
            },
          );
      } else res.status(403).json({ error: '403 Invalid or expired token' });
    },
  );

export default handler;
