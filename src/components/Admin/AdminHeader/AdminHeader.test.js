/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminHeader from './AdminHeader';

test('renders admin header tabs (key=dashboard)', async () => {
  const { getByTestId } = render(
    <AdminHeader
      activeKey="dashboard"
      setKey={jest.fn}
    />,
  );
  const adminTabs = getByTestId('admin-tabs');
  expect(adminTabs).toBeInTheDocument();
});
