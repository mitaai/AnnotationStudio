import { act } from 'react-dom/test-utils';
import { render, wait } from '@testing-library/react';
import Index from '../pages/index';

test('renders header', async () => {
  let navElement;
  act(() => {
    const { getByRole } = render(<Index />);
    navElement = getByRole('navigation');
  });
  await wait(() => {
    expect(navElement).toBeInTheDocument();
  });
});

test('renders footer', async () => {
  let footerElem;
  act(() => {
    const { getByRole } = render(<Index />);
    footerElem = getByRole('contentinfo');
  });
  await wait(() => {
    expect(footerElem).toBeInTheDocument();
  });
});
