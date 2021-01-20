/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import EditGroup from '../../../pages/groups/[id]/edit';
import { group } from '../../../utils/testUtil';


jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/groups/abcd1234/edit',
      query: '',
      asPath: '',
    };
  },
}));

describe('Group Edit Page', () => {
  it('renders group card', async () => {
    const { getByTestId } = render(<EditGroup group={group} />);
    const cardBody = getByTestId('groupedit-card-body');
    await waitFor(() => {
      expect(cardBody).toBeInTheDocument();
    });
  });

  it('renders members table', async () => {
    const { getByTestId } = render(<EditGroup group={group} />);
    const membersTable = getByTestId('groupedit-members-table');
    await waitFor(() => {
      expect(membersTable).toBeInTheDocument();
    });
  });

  it('renders delete button', async () => {
    const { getByTestId } = render(<EditGroup group={group} />);
    const deleteButton = getByTestId('groupedit-delete-button');
    await waitFor(() => {
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
