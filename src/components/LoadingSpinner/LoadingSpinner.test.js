import { render, wait } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

test('renders card.body', async () => {
  const { getByTestId } = render(<LoadingSpinner />);
  const cardElement = getByTestId('loading-spinner-card');
  await wait(() => {
    expect(cardElement).toBeInTheDocument();
  });
});

test('renders spinner element', async () => {
  const { getByTestId } = render(<LoadingSpinner />);
  const spinnerElement = getByTestId('loading-spinner');
  await wait(() => {
    expect(spinnerElement).toBeInTheDocument();
  });
});
