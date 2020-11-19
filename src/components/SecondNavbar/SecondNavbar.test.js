/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import SecondNavbar from './SecondNavbar';
import { userSession } from '../../utils/testUtil';

test('renders second navbar with type = dashboard', async () => {
  const { getByTestId } = render(
    <SecondNavbar
      session={userSession}
      type="dashboard"
    />,
  );
  const navbar = getByTestId('second-navbar');
  expect(navbar).toBeInTheDocument();
});
