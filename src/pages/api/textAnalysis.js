import { ObjectID } from 'mongodb';
import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../utils/dbUtil';
import { calculateSizeOfDataInMB } from '../../utils/annotationUtil';
// Imports the Google Cloud client library
const language = require('@google-cloud/language');
// Creates a client
const client = new language.LanguageServiceClient();


const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      const {
        document,
        analysisId,
        returnData,
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
            const sizeBefore = calculateSizeOfDataInMB({ data: reslt });

            let minSalience = 1;
            let maxSalience = 0;
            for (let i = 0; i < reslt.entities.length; i += 1) {
              reslt.entities[i].frequency = reslt.entities[i].mentions.length;
              reslt.entities[i].mentions = undefined;
              const s = reslt.entities[i].salience;
              if (s < minSalience) {
                minSalience = s;
              }

              if (s > maxSalience) {
                maxSalience = s;
              }
            }

            const diff = maxSalience - minSalience;
            let d = 0;
            if (diff > 0) {
              for (let i = 0; i < reslt.entities.length; i += 1) {
                d = reslt.entities[i].salience - minSalience;
                reslt.entities[i].normalizedSalience = d / diff;
              }
            }

            const size = calculateSizeOfDataInMB({ data: reslt });
            const percentDecrease = (sizeBefore - size) / sizeBefore;

            let doc;
            if (analysisId) {
              doc = await db
                .collection('textAnalysis')
                .updateMany(
                  { _id: ObjectID(analysisId) },
                  {
                    $set: {
                      analysis: reslt,
                    },
                  },
                );
            } else {
              doc = await db
                .collection('textAnalysis')
                .insertOne({ analysis: reslt });
            }

            res.status(200).json({
              analysis: { id: analysisId || doc.insertedId, result: returnData && reslt },
              percentDecrease,
              size,
            });
          })
          .catch((err) => {
            res.status(200).json({
              err,
            });
          });
      } else if (analysisId) {
        const { db } = await connectToDatabase();

        const result = await db
          .collection('textAnalysis')
          .findOne({ _id: ObjectID(analysisId) });

        res.status(200).json({
          analysis: { id: analysisId, result },
        });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
