/**
 * @jest-environment jsdom
 */

import { render, wait } from '@testing-library/react';
import ViewGroup from '../../../pages/groups/[id]/index';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/groups/abcd1234',
      query: '',
      asPath: '',
    };
  },
}));

describe('Group View Page', () => {
  const group = {
    id: 'abcd1234',
    name: 'Test Group',
    members: [{
      id: '1',
      email: 'test@email.com',
      name: 'Test User',
      role: 'owner',
    }],
  };

  it('renders group card', async () => {
    const { getByTestId } = render(<ViewGroup group={group} />);
    const cardBody = getByTestId('groupview-card-body');
    await wait(() => {
      expect(cardBody).toBeInTheDocument();
    });
  });

  it('renders members table', async () => {
    const { getByTestId } = render(<ViewGroup group={group} />);
    const membersTable = getByTestId('groupview-members-table');
    await wait(() => {
      expect(membersTable).toBeInTheDocument();
    });
  });

  it('renders button group', async () => {
    const { getByTestId } = render(<ViewGroup group={group} />);
    const buttonGroup = getByTestId('groupview-button-group');
    await wait(() => {
      expect(buttonGroup).toBeInTheDocument();
    });
  });
});
