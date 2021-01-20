/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import NewGroup from '../../pages/groups/new';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/groups/new',
      query: '',
      asPath: '',
    };
  },
}));

test('renders new group card', async () => {
  const { getByText } = render(<NewGroup />);
  const textElement = getByText(/Create a new group/);
  await waitFor(() => {
    expect(textElement).toBeInTheDocument();
  });
});

test('renders new group Formik form', async () => {
  const { getByTestId } = render(<NewGroup />);
  const submitButton = getByTestId('newgroup-submit-button');
  await waitFor(() => {
    expect(submitButton).toBeInTheDocument();
  });
});
