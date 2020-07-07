import { render, wait } from '@testing-library/react';
import Header from './Header';

test('renders site name', async () => {
  const { getByText } = render(<Header />);
  const nameElement = getByText(/Annotation Studio/);
  await wait(() => {
    expect(nameElement).toBeInTheDocument();
  });
});

test('renders navbar', async () => {
  const { getByRole } = render(<Header />);
  const navElement = getByRole('navigation');
  await wait(() => {
    expect(navElement).toBeInTheDocument();
  });
});

test('renders about dropdown', async () => {
  const { getByRole, getByTestId } = render(<Header />);
  const navElement = getByRole('navigation');
  const aboutDropdown = getByTestId('nav-about-dropdown');
  await wait(() => {
    expect(navElement).toContainElement(aboutDropdown);
  });
});

test('renders help link', async () => {
  const { getByRole, getByTestId } = render(<Header />);
  const navElement = getByRole('navigation');
  const helpLink = getByTestId('nav-help-link');
  await wait(() => {
    expect(navElement).toContainElement(helpLink);
  });
});

test('renders login link', async () => {
  const { getByRole, getByTestId } = render(<Header />);
  const navElement = getByRole('navigation');
  const loginLink = getByTestId('nav-login-link');
  await wait(() => {
    expect(navElement).toContainElement(loginLink);
  });
});
