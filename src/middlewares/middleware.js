import nc from 'next-connect';
import database from './database';

const middleware = nc()
  .use(database);

export default middleware;
