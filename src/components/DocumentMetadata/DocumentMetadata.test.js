/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Formik } from 'formik';
import DocumentMetadata from './DocumentMetadata';
import { document } from '../../utils/testUtil';


describe('document metadata form', () => {
  test('renders with jest context and mocked values', async () => {
    const { findByTestId } = render(
      <Formik onSubmit={jest.fn()}>
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <DocumentMetadata
              resourceType="Book"
              values={document}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
              errors={[]}
              touched={document}
            />
          </form>
        )}
      </Formik>,
    );
    const authorsFormGroup = await findByTestId('contributors-fields');
    expect(authorsFormGroup).toBeInTheDocument();
  });
});
