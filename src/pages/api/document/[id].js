import nc from 'next-connect';
import { ObjectID } from 'mongodb';
import middleware from '../../../middlewares/middleware';

const handler = nc()
  .use(middleware)
  .get(
    async (req, res) => {
      await req.db
        .collection('documents')
        .findOne(
          { _id: ObjectID(req.query.id) },
          (err, doc) => {
            if (doc) {
              const {
                title,
                owner,
                groups,
                resourceType,
                authors,
                publisher,
                publicationDate,
                bookTitle,
                edition,
                url,
                accessed,
                rightsStatus,
                location,
                state,
                text,
                createdAt,
                updatedAt,
                uploadContentType,
                editors,
                volume,
                issue,
                pageNumbers,
                publication,
                notes,
              } = doc;
              if (err) throw err;
              res.status(200).json({
                title,
                owner,
                groups,
                resourceType,
                authors,
                publisher,
                publicationDate,
                bookTitle,
                edition,
                url,
                accessed,
                rightsStatus,
                location,
                state,
                text,
                createdAt,
                updatedAt,
                uploadContentType,
                editors,
                volume,
                issue,
                pageNumbers,
                publication,
                notes,
              });
            } else {
              res.status(404).json({});
            }
          },
        );
    },
  );

export default handler;
