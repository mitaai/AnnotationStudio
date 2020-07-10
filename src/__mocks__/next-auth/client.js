const client = jest.genMockFromModule('next-auth/client');

function useSession() {
  return [
    {
      user: {
        name: 'Test User',
        email: 'test@email.com',
      },
      expires: '2081-10-05T14:48:00.000',
    },
  ];
}

client.useSession = useSession;
module.exports = client;
