/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminPanel from './AdminPanel';

const adminUserSession = {
  user: {
    name: 'Admin User',
    email: 'admin@email.com',
    groups: [{
      id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
    }],
    role: 'admin',
  },
  expires: '2881-10-05T14:48:00.000',
};

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
