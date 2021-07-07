import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';
import { uploadSlateToS3 } from '../../../utils/s3Util';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const dateCreated = new Date(Date.now());
      let { groups } = req.body;
      groups = groups ? groups.filter((group) => group !== '') : {};
      const {
        title,
        slug,
        resourceType,
        contributors,
        publisher,
        publicationDate,
        edition,
        url,
        accessed,
        rightsStatus,
        location,
        state,
        uploadContentType,
        volume,
        issue,
        pageNumbers,
        publication,
        series,
        seriesNumber,
        notes,
      } = req.body;
      const metadata = {
        title,
        slug,
        groups,
        resourceType,
        contributors,
        publisher,
        publicationDate,
        edition,
        url,
        accessed,
        rightsStatus,
        location,
        state,
        uploadContentType,
        volume,
        issue,
        pageNumbers,
        publication,
        series,
        seriesNumber,
        notes,
      };
      Object.keys(metadata).forEach((key) => {
        if (metadata[key] === undefined) {
          delete metadata[key];
        }
      });
      if (Object.keys(metadata).length === 0) {
        res.status(400).end('No request body');
      } else if (!metadata.title) {
        res.status(400).end('Missing title');
      } else {
        let { text } = req.body;
        if (uploadContentType === 'text/slate-html') {
          text = await uploadSlateToS3({ textToUpload: req.body.text })
            .catch((err) => res.status(500).end(err.message));
        }
        const { db } = await connectToDatabase();
        const doc = await db
          .collection('documents')
          .insertOne(
            {
              owner: token.id,
              createdAt: dateCreated,
              updatedAt: dateCreated,
              text,
              ...metadata,
            },
          );
        res.status(200).json(doc);
      }
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default handler;
