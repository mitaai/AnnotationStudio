/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

test('renders welcome text', async () => {
  const { getByText } = render(<AdminDashboard />);
  const welcomeText = getByText(/Welcome to the Administration Panel/);
  expect(welcomeText).toBeInTheDocument();
});
