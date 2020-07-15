import { render, wait } from '@testing-library/react';
import NewUser from '../pages/user/newuser';

test('renders registration card', async () => {
  const { getByText } = render(<NewUser />);
  const textElement = getByText(/Please fill out the following form to complete your registration/);
  await wait(() => {
    expect(textElement).toBeInTheDocument();
  });
});

test('renders registration form', async () => {
  const { getAllByRole } = render(<NewUser />);
  const textboxElements = getAllByRole('textbox');
  await wait(() => {
    expect(textboxElements).toHaveLength(4);
  });
});

test('renders submit button', async () => {
  const { getByTestId } = render(<NewUser />);
  const submitButton = getByTestId('newuser-submit-button');
  await wait(() => {
    expect(submitButton).toBeInTheDocument();
  });
});
