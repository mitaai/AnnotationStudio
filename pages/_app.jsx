/* eslint-disable react/jsx-props-no-spreading */

import '../style/index.css';

// eslint-disable-next-line react/prop-types
export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
