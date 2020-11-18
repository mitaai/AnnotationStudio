/**
 * @jest-environment jsdom
 */

import { act } from 'react-dom/test-utils';
import { render, wait } from '@testing-library/react';
import Layout from './Layout';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/',
      query: '',
      asPath: '',
    };
  },
}));

test('first instance of /Annotation Studio/ has class navbar-brand', async () => {
  let brandElement;
  act(() => {
    const { getAllByText } = render(<Layout />);
    brandElement = getAllByText(/Annotation Studio/);
  });
  await wait(() => {
    expect(brandElement[0]).toHaveClass('navbar-brand');
  });
});
