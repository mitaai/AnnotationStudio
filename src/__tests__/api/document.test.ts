import nc from 'next-connect';
import { testLambda } from '../../utils/lambdaTestUtil';
import { postMethod } from '../../pages/api/document';
import { expectJSONBodyMiddleware } from '../../middlewares/expectJSONBody';
import {
  RequestInitMethod,
} from '../../utils/requestMethods';

afterEach(jest.clearAllMocks);

const url = '/api/document';
const middleware = expectJSONBodyMiddleware;
const docRoute = nc().post(postMethod);

test('should be a function', () => {
  expect(docRoute).toBeInstanceOf(Function);
});

test('results in 404 on get', async () => {
  const method: RequestInitMethod = 'get';
  const response = await testLambda(docRoute, {
    method,
    middleware,
    url,
  });

  expect(response.status).toBe(404);
});

test('results in 400 on empty post', async () => {
  const method: RequestInitMethod = 'post';
  const response = await testLambda(docRoute, {
    method,
    middleware,
    url,
  });

  expect(response.status).toBe(400);
});

test('results in 400 on post with missing title', async () => {
  const method: RequestInitMethod = 'post';
  const response = await testLambda(docRoute, {
    method,
    middleware,
    url,
    body: {
      'notes':'test',
    },
  });

  expect(response.status).toBe(400);
});
