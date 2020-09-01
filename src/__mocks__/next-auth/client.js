const client = jest.genMockFromModule('next-auth/client');

function useSession() {
  return [
    {
      user: {
        name: 'Test User',
        email: 'test@email.com',
        groups: [{
          id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
        }],
      },
      expires: '2881-10-05T14:48:00.000',
    },
  ];
}

client.useSession = useSession;
module.exports = client;
