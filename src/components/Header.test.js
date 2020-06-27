import { render } from '@testing-library/react';
import Header from './Header';

test('renders site name', () => {
  const { getByText } = render(<Header />);
  const nameElement = getByText(/Annotation Studio/);
  expect(nameElement).toBeInTheDocument();
});


test('renders nav and all nav elements', () => {
  const { getByRole, getByTestId } = render(<Header />);
  const navElement = getByRole('navigation');
  expect(navElement).toBeInTheDocument();
  const aboutDropdown = getByTestId('nav-about-dropdown');
  expect(navElement).toContainElement(aboutDropdown);
  const helpLink = getByTestId('nav-help-link');
  expect(navElement).toContainElement(helpLink);
  const loginLink = getByTestId('nav-login-link');
  expect(navElement).toContainElement(loginLink);
});
