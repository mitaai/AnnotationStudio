/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import Header from './Header';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/',
      query: '',
      asPath: '',
    };
  },
}));

test('renders site name', async () => {
  const { getByText } = render(<Header />);
  const nameElement = getByText(/Annotation Studio/);
  await waitFor(() => {
    expect(nameElement).toBeInTheDocument();
  });
});

test('renders navbar', async () => {
  const { getAllByRole } = render(<Header />);
  const navElement = getAllByRole('navigation')[0];
  await waitFor(() => {
    expect(navElement).toBeInTheDocument();
  });
});

test('renders about dropdown', async () => {
  const { getAllByRole, getByTestId } = render(<Header />);
  const navElement = getAllByRole('navigation')[0];
  const aboutDropdown = getByTestId('nav-about-dropdown');
  await waitFor(() => {
    expect(navElement).toContainElement(aboutDropdown);
  });
});

test('renders help link', async () => {
  const { getAllByRole, getByTestId } = render(<Header />);
  const navElement = getAllByRole('navigation')[0];
  const helpLink = getByTestId('nav-help-link');
  await waitFor(() => {
    expect(navElement).toContainElement(helpLink);
  });
});
