import { render } from '@testing-library/react';
import Index from '../pages/index';

it('first instance of /Annotation Studio/ has class navbar-brand', () => {
  const { getAllByText } = render(<Index />);
  const brandElement = getAllByText(/Annotation Studio/)[0];
  expect(brandElement).toHaveClass('navbar-brand');
});
