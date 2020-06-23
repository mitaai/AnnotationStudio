/* eslint-disable react/jsx-props-no-spreading */
/* eslint react/prop-types: 0 */

import '../style/index.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
