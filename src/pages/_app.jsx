/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { Provider } from 'next-auth/client';
import 'semantic-ui-css/components/dropdown.min.css';
import 'semantic-ui-css/components/transition.min.css';
import 'semantic-ui-css/components/label.min.css';
import 'semantic-ui-css/components/icon.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '../style/custom.scss';

export default function MyApp({ Component, pageProps }) {
  const [session, setSession] = useState(pageProps.session);
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} statefulSession={session} updateSession={setSession} />
    </Provider>
  );
}
