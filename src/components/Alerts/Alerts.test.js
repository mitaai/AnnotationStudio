import { render } from '@testing-library/react';
import { mockNextUseRouter } from '../../utils/testUtil.ts';
import Alerts from './Alerts';

describe('alerts', () => {
  const alertName = 'completeRegistration';

  mockNextUseRouter({
    route: '/',
    pathname: '/',
    query: { alert: alertName },
    asPath: `/?alert=${alertName}`,
  });

  test('renders alert', async () => {
    const { findByText } = render(<Alerts />);
    const alert = await findByText(/You have successfully registered for Annotation Studio/);
    expect(alert).toBeInTheDocument();
  });
});
