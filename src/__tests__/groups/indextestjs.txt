/**
 * @jest-environment jsdom
 */

import { render, waitFor } from '@testing-library/react';
import GroupList from '../../pages/groups/index';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      pathname: '/groups',
      query: '',
      asPath: '',
    };
  },
}));

test('renders group list card', async () => {
  const { getByTestId } = render(<GroupList query={{ deletedGroupId: '' }} />);
  const cardBody = getByTestId('grouplist-card-body');
  await waitFor(() => {
    expect(cardBody).toBeInTheDocument();
  });
});

test('renders new group create button', async () => {
  const { getByTestId } = render(<GroupList query={{ deletedGroupId: '' }} />);
  const createButton = getByTestId('grouplist-create-button');
  await waitFor(() => {
    expect(createButton).toBeInTheDocument();
  });
});
