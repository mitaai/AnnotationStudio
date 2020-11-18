/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { ArrowUp } from 'react-bootstrap-icons';
import AdminDocumentList from './AdminDocumentList';

test('renders documents table (empty list)', async () => {
  const { getByTestId } = render(
    <AdminDocumentList
      documents={[]}
      setSortState={jest.fn}
      sortState={{ field: 'createdAt', direction: 'desc' }}
      SortIcon={jest.fn().mockReturnValue(<ArrowUp />)}
    />,
  );
  const docsTable = getByTestId('admin-docs-table');
  expect(docsTable).toBeInTheDocument();
});
