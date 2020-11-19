/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminDocumentTable from './AdminDocumentTable';
import { document } from '../../../../utils/testUtil';

test('renders admin doc view', async () => {
  const { getByTestId } = render(
    <AdminDocumentTable
      document={document}
      setAlerts={jest.fn}
      alerts={[]}
    />,
  );
  const docView = getByTestId('admin-doc-view');
  expect(docView).toBeInTheDocument();
});
