import { render } from '@testing-library/react';
import Index from '../pages/index';

it('renders header', () => {
  const { getByRole } = render(<Index />);
  const navElement = getByRole('navigation');
  expect(navElement).toBeInTheDocument();
});
