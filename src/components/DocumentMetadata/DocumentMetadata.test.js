/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Formik } from 'formik';
import DocumentMetadata from './DocumentMetadata';

// Mock document
const values = {
  _id: 'documenttestid',
  title: 'test',
  contributors: [],
  createdAt: '2881-10-05T14:48:00.000',
  state: 'draft',
  owner: 'testestestest',
  groups: [],
};


describe('document metadata form', () => {
  test('renders with jest context and mocked values', async () => {
    const { findByTestId } = render(
      <Formik onSubmit={jest.fn()}>
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <DocumentMetadata
              resourceType="Book"
              values={values}
              handleChange={props.handleChange}
              handleBlur={props.handleBlur}
              errors={[]}
              touched={values}
            />
          </form>
        )}
      </Formik>,
    );
    const authorsFormGroup = await findByTestId('contributors-fields');
    expect(authorsFormGroup).toBeInTheDocument();
  });
});
