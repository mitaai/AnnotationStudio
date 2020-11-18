/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminDocumentTable from './AdminDocumentTable';

const document = {
  _id: 'documenttestid',
  title: 'test',
  state: 'draft',
  contributors: [],
  createdAt: '2881-10-05T14:48:00.000',
  updatedAt: '2881-10-05T14:48:00.000',
  owner: 'testestestest',
  groups: [],
};

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
