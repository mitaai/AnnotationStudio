/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DashboardGroupList from './DashboardGroupList';
import { userSession } from '../../../utils/testUtil';

test('renders dashboard group list', async () => {
  const { getByTestId } = render(
    <DashboardGroupList
      session={userSession}
    />,
  );
  const groupList = getByTestId('dash-group-list');
  expect(groupList).toBeInTheDocument();
});
