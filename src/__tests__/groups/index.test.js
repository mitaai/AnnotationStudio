import { render, wait } from '@testing-library/react';
import GroupList from '../../pages/groups/index';

test('renders group list card', async () => {
  const { getByTestId } = render(<GroupList query={{ deletedGroupId: '' }} />);
  const cardBody = getByTestId('grouplist-card-body');
  await wait(() => {
    expect(cardBody).toBeInTheDocument();
  });
});

test('renders new group create button', async () => {
  const { getByTestId } = render(<GroupList query={{ deletedGroupId: '' }} />);
  const createButton = getByTestId('grouplist-create-button');
  await wait(() => {
    expect(createButton).toBeInTheDocument();
  });
});
