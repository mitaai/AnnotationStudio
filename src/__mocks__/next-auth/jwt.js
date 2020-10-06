import { ObjectID } from 'mongodb';

const jwt = jest.genMockFromModule('next-auth/jwt');

function getToken() {
  return {
    exp: 1000,
    user: {
      id: ObjectID('123412341234123412341234'),
      name: 'Test User',
      email: 'test@example.com',
    },
  };
}

jwt.getToken = getToken;
module.exports = jwt;
