/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import ViewGroup from '../../../pages/groups/[id]/index';
import { group } from '../../../utils/testUtil';

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
  it('renders group card', async () => {
    const { getByTestId } = render(<ViewGroup group={group} />);
    const cardBody = getByTestId('groupview-card-body');
    await waitFor(() => {
      expect(cardBody).toBeInTheDocument();
    });
  });

  it('renders members table', async () => {
    const { getByTestId } = render(<ViewGroup group={group} />);
    const membersTable = getByTestId('groupview-members-table');
    await waitFor(() => {
      expect(membersTable).toBeInTheDocument();
    });
  });

  it('renders button group', async () => {
    const { getByTestId } = render(<ViewGroup group={group} />);
    const buttonGroup = getByTestId('groupview-button-group');
    await waitFor(() => {
      expect(buttonGroup).toBeInTheDocument();
    });
  });
});
