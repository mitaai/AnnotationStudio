import { userSession } from '../../utils/testUtil';

const client = jest.genMockFromModule('next-auth/react');

const useSession = jest.fn(() => [
  userSession,
  false]);

client.useSession = useSession;
module.exports = client;
