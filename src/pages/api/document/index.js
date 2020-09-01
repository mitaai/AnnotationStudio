import nc from 'next-connect';
import middleware from '../../../middlewares/middleware';
import postDocument from '../../../utils/dbUtil';

const handler = nc()
  .use(middleware)
  .post(postDocument);

export default handler;
