/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DocumentList from './DocumentList';

// Mock document
const document = {
  _id: 'documenttestid',
  title: 'test',
  authors: [],
  createdAt: '2881-10-05T14:48:00.000',
  state: 'draft',
  owner: 'testestestest',
  groups: [],
};

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
