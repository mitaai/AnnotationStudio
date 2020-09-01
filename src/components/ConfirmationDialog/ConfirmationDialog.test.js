import { render } from '@testing-library/react';
import ConfirmationDialog from './ConfirmationDialog';

describe('confirmation dialog', () => {
  test('renders with type = deleteGroup', async () => {
    const { findByText } = render(<ConfirmationDialog
      type="deleteGroup"
      show
      value={{ name: 'fake group' }}
      onClick={jest.fn()}
      handleCloseModal={jest.fn()}
    />);
    const question = await findByText(/Are you sure you want to delete this group permanently\?/);
    expect(question).toBeInTheDocument();
  });
});
