import { render, wait } from '@testing-library/react';
import GroupList from '../../pages/groups/index';

test('renders group list card', async () => {
  const { getByTestId } = render(<GroupList />);
  const cardBody = getByTestId('grouplist-card-body');
  await wait(() => {
    expect(cardBody).toBeInTheDocument();
  });
});

test('renders new group create button', async () => {
  const { getByTestId } = render(<GroupList />);
  const createButton = getByTestId('grouplist-create-button');
  await wait(() => {
    expect(createButton).toBeInTheDocument();
  });
});
