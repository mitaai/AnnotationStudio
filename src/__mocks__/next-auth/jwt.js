const { getObjectId } = require('mongo-seeding');

const jwt = jest.genMockFromModule('next-auth/jwt');

function getToken() {
  return {
    exp: 1000,
    user: {
      id: getObjectId('test-user'),
      name: 'Test User',
      email: 'test@example.com',
    },
  };
}

jwt.getToken = getToken;
module.exports = jwt;
