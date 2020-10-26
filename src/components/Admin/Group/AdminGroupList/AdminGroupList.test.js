/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminGroupList from './AdminGroupList';

test('renders groups table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminGroupList
      groups={[]}
      loading={false}
    />,
  );
  const groupsTable = getByTestId('admin-groups-table');
  expect(groupsTable).toBeInTheDocument();
});
