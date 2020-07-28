const { createServer } = require('http');
const request = require('supertest');
const nc = require('next-connect');
const postDocument = require('../../utils/dbUtil');

describe('document POST endpoint', () => {
  const url = '/';
  const handler = nc().post(url, postDocument);

  it('results in 404 on get', async () => {
    const app = createServer(handler);
    const result = await request(app).get(url);
    expect(result.status).toBe(404);
  });

  it('results in 200 on post', async () => {
    const app = createServer(handler);
    const result = await request(app).post(url).send({
      text: 'test',
    });
    expect(result.status).toBe(200);
  });
});
