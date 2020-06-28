import { render } from '@testing-library/react';
import Index from '../pages/index';

it('renders header', () => {
  const { getByRole } = render(<Index />);
  const navElement = getByRole('navigation');
  expect(navElement).toBeInTheDocument();
});

test('renders footer', () => {
  const { getByRole } = render(<Index />);
  const footerElem = getByRole('contentinfo');
  expect(footerElem).toBeInTheDocument();
});
