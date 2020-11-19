/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Formik } from 'formik';
import DocumentStatusSelect from './DocumentStatusSelect';
import { document, userSession } from '../../utils/testUtil';

describe('document status select', () => {
  test('renders with jest context and mocked values', async () => {
    const { findByTestId } = render(
      <Formik onSubmit={jest.fn()}>
        {(props) => (
          <form onSubmit={props.handleSubmit}>
            <DocumentStatusSelect
              values={document}
              onChange={props.handleChange}
              onBlur={props.handleBlur}
              session={userSession}
            />
          </form>
        )}
      </Formik>,
    );
    const statusFormGroup = await findByTestId('status-select-form');
    expect(statusFormGroup).toBeInTheDocument();
  });
});
