/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminUserTable from './AdminUserTable';
import { user } from '../../../../utils/testUtil';

test('renders admin user view', async () => {
  const { getByTestId } = render(
    <AdminUserTable
      user={user}
      setAlerts={jest.fn}
      alerts={[]}
      isSelf
    />,
  );
  const userTable = getByTestId('admin-user-view');
  expect(userTable).toBeInTheDocument();
});
