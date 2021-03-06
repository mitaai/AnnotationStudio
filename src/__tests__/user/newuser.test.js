/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import NewUser from '../../pages/user/newuser';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/user/newuser',
      query: '',
      asPath: '',
    };
  },
}));

test('renders registration card', async () => {
  const { getByText } = render(<NewUser />);
  const textElement = getByText(/Please fill out the following form to complete your registration/);
  await waitFor(() => {
    expect(textElement).toBeInTheDocument();
  });
});

test('renders registration form', async () => {
  const { getAllByRole } = render(<NewUser />);
  const textboxElements = getAllByRole('textbox');
  await waitFor(() => {
    expect(textboxElements).toHaveLength(4);
  });
});

test('renders submit button', async () => {
  const { getByTestId } = render(<NewUser />);
  const submitButton = getByTestId('newuser-submit-button');
  await waitFor(() => {
    expect(submitButton).toBeInTheDocument();
  });
});
