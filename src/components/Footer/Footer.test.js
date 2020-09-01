/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import Footer from './Footer';

test('renders MIT logo', () => {
  const { getByAltText } = render(<Footer />);
  const mitLogo = getByAltText('MIT logo');
  expect(mitLogo).toBeInTheDocument();
});

test('renders AAI logo', () => {
  const { getByAltText } = render(<Footer />);
  const aaiLogo = getByAltText('Active Archives Initiative logo');
  expect(aaiLogo).toBeInTheDocument();
});

test('renders NEH logo', () => {
  const { getByAltText } = render(<Footer />);
  const nehLogo = getByAltText('National Endowment for the Humanities logo');
  expect(nehLogo).toBeInTheDocument();
});
