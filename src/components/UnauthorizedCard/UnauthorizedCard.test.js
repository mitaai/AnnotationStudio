/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import UnauthorizedCard from './UnauthorizedCard';

test('renders card', () => {
  const { getByText } = render(<UnauthorizedCard />);
  const cardTitle = getByText('Not authorized');
  expect(cardTitle).toBeInTheDocument();
});
