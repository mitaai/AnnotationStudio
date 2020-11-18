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

test('renders documents table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminDocumentTable
      document={document}
      setAlerts={jest.fn}
      alerts={[]}
    />,
  );
  const docsTable = getByTestId('admin-doc-view');
  expect(docsTable).toBeInTheDocument();
});
