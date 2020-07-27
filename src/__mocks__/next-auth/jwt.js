const { getObjectId } = require('mongo-seeding');

const jwt = jest.genMockFromModule('next-auth/jwt');

function getJwt() {
  return {
    exp: 1000,
    user: {
      id: getObjectId('test-user'),
      name: 'Test User',
      email: 'test@example.com',
    },
  };
}

jwt.getJwt = getJwt;
module.exports = jwt;
