/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminPanel from './AdminPanel';
import { adminUserSession } from '../../../utils/testUtil';

test('renders admin panel', async () => {
  const { getByTestId } = render(
    <AdminPanel
      alerts={[]}
      setAlerts={jest.fn}
      session={adminUserSession}
      activeKey="dashboard"
      setKey={jest.fn}
    />,
  );
  const adminPanel = getByTestId('admin-panel');
  expect(adminPanel).toBeInTheDocument();
});
