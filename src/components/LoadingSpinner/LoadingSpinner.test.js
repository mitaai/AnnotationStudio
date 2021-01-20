/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

test('renders card.body', async () => {
  const { getByTestId } = render(<LoadingSpinner />);
  const cardElement = getByTestId('loading-spinner-card');
  await waitFor(() => {
    expect(cardElement).toBeInTheDocument();
  });
});

test('renders spinner element', async () => {
  const { getByTestId } = render(<LoadingSpinner />);
  const spinnerElement = getByTestId('loading-spinner');
  await waitFor(() => {
    expect(spinnerElement).toBeInTheDocument();
  });
});
