import { render, wait } from '@testing-library/react';
import { mockNextUseRouter } from '../utils/testUtil.ts';
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
    const { getByText } = render(<Alerts />);
    const alert = getByText('Close alert');
    await wait(() => {
      expect(alert).toBeInTheDocument();
    });
  });
});
