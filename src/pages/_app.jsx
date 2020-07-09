/* eslint-disable react/jsx-props-no-spreading */

import '../style/custom.scss';
import '../style/style.scss';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
