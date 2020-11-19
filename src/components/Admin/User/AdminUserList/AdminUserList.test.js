/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { ArrowUp } from 'react-bootstrap-icons';
import AdminUserList from './AdminUserList';

test('renders users table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminUserList
      users={[]}
      setSortState={jest.fn}
      sortState={{ field: 'createdAt', direction: 'desc' }}
      SortIcon={jest.fn().mockReturnValue(<ArrowUp />)}
    />,
  );
  const usersTable = getByTestId('admin-users-table');
  expect(usersTable).toBeInTheDocument();
});
