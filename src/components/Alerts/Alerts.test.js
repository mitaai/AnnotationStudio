/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import Alerts from './Alerts';

describe('alerts', () => {
  const alerts = [{
    text: 'You have successfully registered for Annotation Studio. Welcome!',
    variant: 'success',
  }];

  test('renders alert', async () => {
    const { findByText } = render(<Alerts alerts={alerts} />);
    const alert = await findByText(/You have successfully registered for Annotation Studio/);
    expect(alert).toBeInTheDocument();
  });
});
