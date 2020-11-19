/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminGroupTable from './AdminGroupTable';
import { group } from '../../../../utils/testUtil';

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
