/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Formik } from 'formik';
import DocumentStatusSelect from './DocumentStatusSelect';

// Mock document
const values = {
  _id: 'documenttestid',
  title: 'test',
  authors: [],
  createdAt: '2881-10-05T14:48:00.000',
  state: 'draft',
  owner: 'testestestest',
  groups: [],
};


describe('document status select', () => {
  test('renders with jest context and mocked values', async () => {
    const { findByTestId } = render(
      <Formik onSubmit={jest.fn()}>
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <DocumentStatusSelect
              values={values}
              onChange={props.handleChange}
              onBlur={props.handleBlur}
            />
          </form>
        )}
      </Formik>,
    );
    const statusFormGroup = await findByTestId('status-select-form');
    expect(statusFormGroup).toBeInTheDocument();
  });
});
