/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DocumentList from './DocumentList';
import { document } from '../../utils/testUtil';

describe('document list', () => {
  test('renders with a mocked document', async () => {
    const { findByTestId } = render(<DocumentList
      documents={[document]}
      setDocuments={jest.fn()}
      loading={false}
      userId="testestestest"
      alerts={[]}
      setAlerts={jest.fn()}
    />);
    const documentsTable = await findByTestId('documents-table');
    expect(documentsTable).toBeInTheDocument();
  });
});
