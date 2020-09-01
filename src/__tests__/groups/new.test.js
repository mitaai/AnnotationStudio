import { render, wait } from '@testing-library/react';
import NewGroup from '../../pages/groups/new';

test('renders new group card', async () => {
  const { getByText } = render(<NewGroup />);
  const textElement = getByText(/Create a new group/);
  await wait(() => {
    expect(textElement).toBeInTheDocument();
  });
});

test('renders new group Formik form', async () => {
  const { getByTestId } = render(<NewGroup />);
  const submitButton = getByTestId('newgroup-submit-button');
  await wait(() => {
    expect(submitButton).toBeInTheDocument();
  });
});
