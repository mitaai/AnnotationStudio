/* eslint-disable prefer-destructuring */
/* eslint-disable import/prefer-default-export */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local',
  );
}

if (!DB_NAME) {
  throw new Error(
    'Please define the DB_NAME environment variable inside .env.local',
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentiatlly
 * during API Route usage.
 */
let cached = global.mongo;
if (!cached) {
  global.mongo = {};
  cached = global.mongo;
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const conn = {};
    const opts = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    cached.promise = MongoClient.connect(MONGODB_URI, opts)
      .then((client) => {
        conn.client = client;
        return client.db(DB_NAME);
      })
      .then((db) => {
        db.collection('users').createIndex({ email: 1 }, { unique: true });
        db.collection('users').createIndex({ email: 'text' });
        db.collection('documents').createIndex({ groups: 1 });
        db.collection('documents').createIndex({ owner: 1 });
        conn.db = db;
        cached.conn = conn;
      });
  }
  await cached.promise;
  return cached.conn;
}
