/* eslint-disable import/prefer-default-export */
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

let cachedClient = null;
let cachedDb = null;

if (!uri) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local',
  );
}

if (!dbName) {
  throw new Error(
    'Please define the DB_NAME environment variable inside .env.local',
  );
}

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = await client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  db.collection('users').createIndex({ email: 1 }, { unique: true });
  db.collection('users').createIndex({ slug: 1 }, { unique: true });
  db.collection('documents').createIndex({ groups: 1 });
  db.collection('documents').createIndex({ owner: 1 });

  return { client, db };
}
