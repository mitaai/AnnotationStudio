import { ObjectID } from 'mongodb';
import jwt from 'next-auth/jwt';
import { connectToDatabase } from '../../../utils/dbUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'GET') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const doc = await db
        .collection('annotations')
        .find({
          _id: ObjectID(req.query.id),
        })
        .toArray();
      if (doc[0]) {
        const annotation = doc[0];
        const {
          _id,
          type,
          creator,
          permissions,
          created,
          modified,
          body,
          target,
        } = annotation;
        res.status(200).json({
          id: _id,
          type,
          creator,
          permissions,
          created,
          modified,
          body,
          target,
        });
      } else res.status(404).end('Not Found');
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'PATCH') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const { role } = userObj;
      let findCondition = { _id: ObjectID(req.query.id), 'creator.id': token.id };
      if (role === 'admin') {
        findCondition = { _id: ObjectID(req.query.id) };
      }
      const { body, permissions } = req.body;
      if (body || permissions) {
        const updateMethods = { $set: { } };
        if (body) updateMethods.$set.body = { ...body };
        if (permissions) updateMethods.$set.permissions = { ...permissions };
        updateMethods.$currentDate = { modified: true };
        const doc = await db
          .collection('annotations')
          .findOneAndUpdate(
            findCondition,
            updateMethods,
            {
              returnOriginal: false,
            },
          );
        if (doc !== null) res.status(200).json(doc);
        else res.status(404).end('Annotation not found');
      } else res.status(400).end('Invalid request body: missing body or permissions');
    } else res.status(403).end('Invalid or expired token');
  } else if (method === 'DELETE') {
    const token = await jwt.getToken({ req, secret });
    if (token && token.exp > 0) {
      const { db } = await connectToDatabase();
      const userObj = await db
        .collection('users')
        .findOne({ _id: ObjectID(token.id) });
      const { role } = userObj;
      let findCondition = { _id: ObjectID(req.query.id), 'creator.id': token.id };
      if (role === 'admin') {
        findCondition = { _id: ObjectID(req.query.id) };
      }
      const doc = await db
        .collection('annotations')
        .findOneAndDelete(
          findCondition,
        );
      if (doc !== null) res.status(200).json(doc);
      else res.status(404).end('Annotation not found');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
