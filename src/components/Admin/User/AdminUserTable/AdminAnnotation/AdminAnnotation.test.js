/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import AdminAnnotation from './AdminAnnotation';
import { annotation } from '../../../../../utils/testUtil';

test('renders annotation', async () => {
  const { getByTestId } = render(
    <AdminAnnotation
      annotation={annotation}
    />,
  );
  const adminAnnotation = getByTestId('admin-annotation');
  expect(adminAnnotation).toBeInTheDocument();
});
