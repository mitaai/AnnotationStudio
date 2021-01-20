/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import EditProfile from '../../pages/user/[slug]/editprofile';
import { user } from '../../utils/testUtil';

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
  const { getAllByText } = render(<EditProfile user={user} />);
  const textElements = getAllByText(/Edit Profile/);
  await waitFor(() => {
    expect(textElements[1]).toBeInTheDocument();
  });
});

test('renders edit profile form', async () => {
  const { getAllByRole } = render(<EditProfile user={user} />);
  const textboxElements = getAllByRole('textbox');
  await waitFor(() => {
    expect(textboxElements).toHaveLength(4);
  });
});

test('renders submit button', async () => {
  const { getByTestId } = render(<EditProfile user={user} />);
  const submitButton = getByTestId('editprofile-submit-button');
  await waitFor(() => {
    expect(submitButton).toBeInTheDocument();
  });
});
