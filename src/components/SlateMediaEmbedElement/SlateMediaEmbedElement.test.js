/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { Formik } from 'formik';
import SlateMediaEmbedElement from './SlateMediaEmbedElement';

test('renders slate media embed element', async () => {
  const { getByTestId } = render(
    <Formik>
      <SlateMediaEmbedElement
        element={{ url: 'https://www.youtube.com/watch?v=dGxZ4K-J5YE' }}
      />
    </Formik>,
  );
  const elem = getByTestId('slate-iframe');
  expect(elem).toBeInTheDocument();
});
