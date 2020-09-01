/**
 * @jest-environment jsdom
 */

import { render, wait } from '@testing-library/react';
import EditProfile from '../../pages/user/[slug]/editprofile';

test('renders edit profile card', async () => {
  const { getByText } = render(<EditProfile user={{
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@email.com',
    affiliation: 'Jest Tests',
  }}
  />);
  const textElement = getByText(/Edit Profile/);
  await wait(() => {
    expect(textElement).toBeInTheDocument();
  });
});

test('renders edit profile form', async () => {
  const { getAllByRole } = render(<EditProfile user={{
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@email.com',
    affiliation: 'Jest Tests',
  }}
  />);
  const textboxElements = getAllByRole('textbox');
  await wait(() => {
    expect(textboxElements).toHaveLength(4);
  });
});

test('renders submit button', async () => {
  const { getByTestId } = render(<EditProfile user={{
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@email.com',
    affiliation: 'Jest Tests',
  }}
  />);
  const submitButton = getByTestId('editprofile-submit-button');
  await wait(() => {
    expect(submitButton).toBeInTheDocument();
  });
});
