import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { S3 } from 'aws-sdk';
import { connectToDatabase } from '../../../utils/dbUtil';


const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'DELETE') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      const {
        role,
        ownerId,
        // this happens when a file is processed and uploaded for a document but the document is
        // never created or the user wants to upload a new file so they need to delete the old one
        // in the background
        noOwner,
        fileObj,
      } = req.body;
      const { db } = await connectToDatabase();
      let hasAccessToDelete = false;
      if (noOwner || token.sub === ownerId || role === 'admin') {
        hasAccessToDelete = true;
      } else {
        const userObj = await db.collection('users').findOne({ _id: ObjectID(token.sub) });
        hasAccessToDelete = userObj.role === 'admin';
      }
      if (hasAccessToDelete) {
        if (fileObj.processedUrlKey) {
          const bucketParamsArr = [{
            Bucket: 'as4-processed-html',
            Key: fileObj.processedUrlKey,
          }].concat(fileObj.urlKey ? [{
            Bucket: 'as4-uploads',
            Key: fileObj.urlKey,
          }] : []);

          const s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
          });

          const results = await Promise.all(bucketParamsArr.map(async (bucketParams) => {
            const r = await s3.deleteObject(bucketParams).promise();
            return r;
          }));

          res.status(200).json(results);
        } else res.status(400).end('Bad request');
      } else res.status(403).end('Denied Access: user is not owner or admin');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;

