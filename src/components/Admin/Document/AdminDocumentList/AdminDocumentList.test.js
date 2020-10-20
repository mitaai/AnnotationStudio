/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminDocumentList from './AdminDocumentList';

test('renders documents table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminDocumentList
      documents={[]}
      loading={false}
      alerts={[]}
      setAlerts={jest.fn()}
    />,
  );
  const docsTable = getByTestId('admin-docs-table');
  expect(docsTable).toBeInTheDocument();
});
