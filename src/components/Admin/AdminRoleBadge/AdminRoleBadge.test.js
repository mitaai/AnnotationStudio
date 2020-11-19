/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminRoleBadge from './AdminRoleBadge';

test('renders admin role badge', async () => {
  const { getByTestId } = render(<AdminRoleBadge />);
  const roleBadge = getByTestId('admin-role-badge');
  expect(roleBadge).toBeInTheDocument();
});
