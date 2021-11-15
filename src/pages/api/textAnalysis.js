// Imports the Google Cloud client library
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';
import { calculateSizeOfDataInMB } from '../../utils/annotationUtil';

const language = require('@google-cloud/language');
// Creates a client
const client = new language.LanguageServiceClient();


const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        document,
      } = req.body;

      if (document) {
        const { db } = await connectToDatabase();

        const opts = {
          document,
          features: {
            extractSyntax: true,
            extractEntities: true,
            extractDocumentSentiment: true,
            extractEntitySentiment: true,
            classifyText: true,
          },
          encodingType: 'UTF8',
        };

        client.annotateText(opts)
          .then(async ([result]) => {
            const reslt = result;
            const sizeBefore = calculateSizeOfDataInMB({ data: result });

            for (let i = 0; i < reslt.entities.length; i += 1) {
              reslt.entities[i].mentions = undefined;
            }

            const size = calculateSizeOfDataInMB({ data: reslt });
            const percentDecrease = (sizeBefore - size) / sizeBefore;

            const doc = await db
              .collection('textAnalysis')
              .insertOne(reslt);

            res.status(200).json({
              analysis: { id: doc.insertedId, result: reslt },
              percentDecrease,
              size,
            });
          })
          .catch((err) => {
            res.status(200).json({
              err,
            });
          });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
