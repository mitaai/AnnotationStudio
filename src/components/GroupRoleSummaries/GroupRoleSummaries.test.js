import { render, wait } from '@testing-library/react';
import GroupRoleSummaries from './GroupRoleSummaries';

test('renders card', async () => {
  const { getByTestId } = render(<GroupRoleSummaries />);
  const cardElement = getByTestId('group-roles-card');
  await wait(() => {
    expect(cardElement).toBeInTheDocument();
  });
});

test('renders list', async () => {
  const { getByTestId } = render(<GroupRoleSummaries />);
  const listElement = getByTestId('group-roles-list');
  await wait(() => {
    expect(listElement).toBeInTheDocument();
  });
});

test('displays info text', async () => {
  const { getByText } = render(<GroupRoleSummaries />);
  const textElement = getByText('Members');
  await wait(() => {
    expect(textElement).toBeInTheDocument();
  });
});
