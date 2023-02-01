import { getToken } from 'next-auth/jwt';
import { connectToDatabase } from '../../../../utils/dbUtil';
import { escapeRegExp } from '../../../../utils/stringUtil';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await getToken({ req, secret });
    if (token && token.exp > 0) {
      const {
        query, perPage, page, sort = {}, condition,
      } = req.body;

      // eslint-disable-next-line no-useless-escape
      const r = query ? new RegExp(`\.\*${escapeRegExp(query)}\.\*`, 'i') : new RegExp('\.\*', 'i');

      let ownerCondition = condition.permissions === 'mine' ? { owner: token.sub } : {};
      if (condition?.groupOwnersAndManagers) {
        const obj = { $in: condition.groupOwnersAndManagers };
        if (condition.permissions === 'core-documents') {
          ownerCondition = { owner: obj };
        } else if (condition.permissions === 'shared') {
          ownerCondition = { owner: { $not: obj } };
        }
      }

      const { db } = await connectToDatabase();
      const arr = await db
        .collection('documents')
        .find({
          $and: [
            condition?.noDrafts
              ? { state: { $not: { $eq: 'draft' } } }
              : {},
            { title: r },
            ...(
              condition ? [
                ownerCondition,
                {
                  groups: condition.group === 'privateGroup' ? [] : condition.group,
                },
              ] : []
            ),
          ],
        })
        .sort(sort)
        .skip(page > 0 ? ((page - 1) * perPage) : 0)
        .limit(perPage === undefined ? 0 : parseInt(perPage, 10))
        .toArray();

      res.status(200).json({ documents: arr });
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
