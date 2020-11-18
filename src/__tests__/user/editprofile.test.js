/**
 * @jest-environment jsdom
 */

import { render, wait } from '@testing-library/react';
import EditProfile from '../../pages/user/[slug]/editprofile';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/user/editprofile',
      query: '',
      asPath: '',
    };
  },
}));

test('renders edit profile card', async () => {
  const { getAllByText } = render(<EditProfile user={{
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@email.com',
    affiliation: 'Jest Tests',
  }}
  />);
  const textElements = getAllByText(/Edit Profile/);
  await wait(() => {
    expect(textElements[1]).toBeInTheDocument();
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
