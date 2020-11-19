/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { ArrowUp } from 'react-bootstrap-icons';
import SortableHeader from './SortableHeader';

test('renders sortable header (no children)', async () => {
  const { getByTestId } = render(
    <table>
      <thead>
        <tr>
          <SortableHeader
            field="createdAt"
            setSortState={jest.fn}
            sortState={{ field: 'createdAt', direction: 'desc' }}
            SortIcon={jest.fn().mockReturnValue(<ArrowUp />)}
          />
        </tr>
      </thead>
    </table>,
  );
  const sortableHeader = getByTestId('sortable-header');
  expect(sortableHeader).toBeInTheDocument();
});
