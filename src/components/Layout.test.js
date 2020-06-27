import { render } from '@testing-library/react';
import Layout from './Layout';

it('first instance of /Annotation Studio/ has class navbar-brand', () => {
  const { getAllByText } = render(<Layout />);
  const brandElement = getAllByText(/Annotation Studio/)[0];
  expect(brandElement).toHaveClass('navbar-brand');
});
