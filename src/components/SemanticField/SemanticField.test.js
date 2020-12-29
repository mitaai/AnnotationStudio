/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Formik } from 'formik';
import SemanticField from './SemanticField';

test('renders semantic field', async () => {
  const { getByRole } = render(
    <Formik>
      <SemanticField
        component="input"
        type="text"
      />
    </Formik>,
  );
  const field = getByRole('textbox');
  expect(field).toBeInTheDocument();
});
