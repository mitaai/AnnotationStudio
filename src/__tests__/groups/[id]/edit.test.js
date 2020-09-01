import { render, wait } from '@testing-library/react';
import EditGroup from '../../../pages/groups/[id]/edit';

describe('Group Edit Page', () => {
  const group = {
    id: 'abcd1234',
    name: 'Test Group',
    members: [{
      id: '1',
      email: 'test@email.com',
      name: 'Test User',
      role: 'owner',
    }],
    inviteUrl: '',
  };

  it('renders group card', async () => {
    const { getByTestId } = render(<EditGroup group={group} />);
    const cardBody = getByTestId('groupedit-card-body');
    await wait(() => {
      expect(cardBody).toBeInTheDocument();
    });
  });

  it('renders members table', async () => {
    const { getByTestId } = render(<EditGroup group={group} />);
    const membersTable = getByTestId('groupedit-members-table');
    await wait(() => {
      expect(membersTable).toBeInTheDocument();
    });
  });

  it('renders delete button', async () => {
    const { getByTestId } = render(<EditGroup group={group} />);
    const deleteButton = getByTestId('groupedit-delete-button');
    await wait(() => {
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
