/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DashboardAnnotationList from './DashboardAnnotationList';
import { userSession } from '../../../utils/testUtil';

test('renders dashboard annotation list', async () => {
  const { getByTestId } = render(
    <DashboardAnnotationList
      session={userSession}
      alerts={[]}
      setAlerts={jest.fn}
      mode="dashboard"
    />,
  );
  const annotationList = getByTestId('dash-annotation-list');
  expect(annotationList).toBeInTheDocument();
});
