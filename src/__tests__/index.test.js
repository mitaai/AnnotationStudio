import { act } from 'react-dom/test-utils';
import { render, wait } from '@testing-library/react';
import Index from '../pages/index';

test('renders header', async () => {
  let navElement;
  act(() => {
    const { getAllByRole } = render(<Index props={{ groupId: '' }} />);
    [navElement] = getAllByRole('navigation');
  });
  await wait(() => {
    expect(navElement).toBeInTheDocument();
  });
});

test('renders footer', async () => {
  let footerElem;
  act(() => {
    const { getByRole } = render(<Index props={{ groupId: '' }} />);
    footerElem = getByRole('contentinfo');
  });
  await wait(() => {
    expect(footerElem).toBeInTheDocument();
  });
});
