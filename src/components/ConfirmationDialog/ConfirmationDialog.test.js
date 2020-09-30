/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import ConfirmationDialog from './ConfirmationDialog';

describe('confirmation dialog', () => {
  test('renders with type = group', async () => {
    const { findByText } = render(<ConfirmationDialog
      type="group"
      show
      name="fake group"
      onClick={jest.fn()}
      handleCloseModal={jest.fn()}
    />);
    const question = await findByText(/Are you sure you want to delete this group permanently\?/);
    expect(question).toBeInTheDocument();
  });
});
