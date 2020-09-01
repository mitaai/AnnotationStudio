import { render, wait } from '@testing-library/react';
import GroupRoleBadge from '.';

test('renders badge', async () => {
  const { getByTestId } = render(<GroupRoleBadge groupRole="test" />);
  const badgeElement = getByTestId('group-role-badge');
  await wait(() => {
    expect(badgeElement).toBeInTheDocument();
  });
});

test('renders text', async () => {
  const { getByText } = render(<GroupRoleBadge groupRole="owner" />);
  const badgeText = getByText('owner');
  await wait(() => {
    expect(badgeText).toBeInTheDocument();
  });
});
