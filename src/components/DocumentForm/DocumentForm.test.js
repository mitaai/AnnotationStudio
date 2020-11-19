/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import DocumentForm from './DocumentForm';
import { document, userSession } from '../../utils/testUtil';

// Mock session
const session = userSession;

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
