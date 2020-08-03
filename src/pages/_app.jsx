/* eslint-disable react/jsx-props-no-spreading */

import { Provider } from 'next-auth/client';
import '../style/custom.scss';

export default function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  );
}
