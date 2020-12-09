/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DashboardDocumentList from './DashboardDocumentList';
import { userSession } from '../../../utils/testUtil';

test('renders dashboard document list', async () => {
  const { getByTestId } = render(
    <DashboardDocumentList
      session={userSession}
      alerts={[]}
      setAlerts={jest.fn}
    />,
  );
  const documentList = getByTestId('dash-document-list');
  expect(documentList).toBeInTheDocument();
});
