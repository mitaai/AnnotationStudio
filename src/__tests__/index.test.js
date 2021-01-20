/**
 * @jest-environment jsdom
 */

import { act } from 'react-dom/test-utils';
import { render, waitFor } from '@testing-library/react';
import fetch from 'unfetch';
import Index from '../pages/index';

jest.mock('unfetch');

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/',
      query: '',
      asPath: '',
    };
  },
}));

test('renders header', async () => {
  let navElement;
  fetch.mockReturnValueOnce([]);
  act(() => {
    const { getAllByRole } = render(<Index props={{ groupId: '' }} />);
    [navElement] = getAllByRole('navigation');
  });
  await waitFor(() => {
    expect(navElement).toBeInTheDocument();
  });
});

test('renders footer', async () => {
  let footerElem;
  act(() => {
    const { getByRole } = render(<Index props={{ groupId: '' }} />);
    footerElem = getByRole('contentinfo');
  });
  await waitFor(() => {
    expect(footerElem).toBeInTheDocument();
  });
});
