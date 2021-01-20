/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import GroupRoleSummaries from './GroupRoleSummaries';

test('renders card', async () => {
  const { getByTestId } = render(<GroupRoleSummaries />);
  const cardElement = getByTestId('group-roles-card');
  await waitFor(() => {
    expect(cardElement).toBeInTheDocument();
  });
});

test('renders list', async () => {
  const { getByTestId } = render(<GroupRoleSummaries />);
  const listElement = getByTestId('group-roles-list');
  await waitFor(() => {
    expect(listElement).toBeInTheDocument();
  });
});

test('displays info text', async () => {
  const { getByText } = render(<GroupRoleSummaries />);
  const textElement = getByText('Members');
  await waitFor(() => {
    expect(textElement).toBeInTheDocument();
  });
});
