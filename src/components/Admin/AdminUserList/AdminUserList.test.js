/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminUserList from './AdminUserList';

test('renders groups table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminUserList
      users={[]}
      loading={false}
    />,
  );
  const usersTable = getByTestId('admin-users-table');
  expect(usersTable).toBeInTheDocument();
});
