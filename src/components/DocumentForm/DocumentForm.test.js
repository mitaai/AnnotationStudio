/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DocumentForm from './DocumentForm';

// Mock session
const session = {
  user: {
    id: 'testestestest',
    name: 'Test User',
    email: 'test@email.com',
    groups: [{
      id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
    }],
  },
  expires: '2881-10-05T14:48:00.000',
};

// Mock document
const document = {
  _id: 'documenttestid',
  title: 'test',
  state: 'draft',
  contributors: [],
  createdAt: '2881-10-05T14:48:00.000',
  owner: 'testestestest',
  groups: [],
};

describe('document form', () => {
  test('renders with mode = new', async () => {
    const { findByTestId } = render(<DocumentForm
      mode="new"
      session={session}
    />);
    const submitButton = await findByTestId('documentform-submit-button');
    expect(submitButton).toBeInTheDocument();
  });
  test('renders with mode = edit', async () => {
    const { findByTestId } = render(<DocumentForm
      mode="edit"
      session={session}
      data={document}
    />);
    const deleteButton = await findByTestId('documentedit-delete-button');
    expect(deleteButton).toBeInTheDocument();
  });
});
