/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminGroupTable from './AdminGroupTable';

const group = {
  id: 'abcd1234',
  name: 'Test Group',
  members: [{
    id: '1',
    email: 'test@email.com',
    name: 'Test User',
    role: 'owner',
  }],
  createdAt: '2881-10-05T14:48:00.000',
  updatedAt: '2881-10-05T14:48:00.000',
};

test('renders admin group view', async () => {
  const { getByTestId } = render(
    <AdminGroupTable
      group={group}
      setAlerts={jest.fn}
      alerts={[]}
    />,
  );
  const groupTable = getByTestId('admin-group-view');
  expect(groupTable).toBeInTheDocument();
});
