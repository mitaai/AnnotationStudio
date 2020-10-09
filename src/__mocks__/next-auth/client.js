const client = jest.genMockFromModule('next-auth/client');

const useSession = jest.fn(() => [
  {
    user: {
      name: 'Test User',
      email: 'test@email.com',
      groups: [{
        id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
      }],
      role: 'user',
    },
    expires: '2881-10-05T14:48:00.000',
  },
  false]);

client.useSession = useSession;
module.exports = client;
