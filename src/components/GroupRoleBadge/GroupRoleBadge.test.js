/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import GroupRoleBadge from '.';

test('renders badge', async () => {
  const { getByTestId } = render(<GroupRoleBadge groupRole="test" />);
  const badgeElement = getByTestId('group-role-badge');
  await waitFor(() => {
    expect(badgeElement).toBeInTheDocument();
  });
});

test('renders text', async () => {
  const { getByText } = render(<GroupRoleBadge groupRole="owner" />);
  const badgeText = getByText('owner');
  await waitFor(() => {
    expect(badgeText).toBeInTheDocument();
  });
});
