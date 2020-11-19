/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { ArrowUp } from 'react-bootstrap-icons';
import AdminGroupList from './AdminGroupList';

test('renders groups table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminGroupList
      groups={[]}
      setSortState={jest.fn}
      sortState={{ field: 'createdAt', direction: 'desc' }}
      SortIcon={jest.fn().mockReturnValue(<ArrowUp />)}
    />,
  );
  const groupsTable = getByTestId('admin-groups-table');
  expect(groupsTable).toBeInTheDocument();
});
