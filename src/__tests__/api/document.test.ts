import handler from '../../pages/api/document';
import { createMocks } from 'node-mocks-http';

afterEach(jest.clearAllMocks);

describe('/api/document', () => {
  
  test('handler should be a function', () => {
    expect(handler).toBeInstanceOf(Function);
  });

  test('results in 405 on GET', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  test('results in 400 on empty post', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });

  test('results in 400 on post with missing title', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        'notes':'test',
      },
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(400);
  });
});
