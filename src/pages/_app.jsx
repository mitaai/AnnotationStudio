/* eslint-disable react/jsx-props-no-spreading */
import { useState } from 'react';
import { Provider } from 'next-auth/client';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import 'semantic-ui-css/components/dropdown.min.css';
import 'semantic-ui-css/components/transition.min.css';
import 'semantic-ui-css/components/label.min.css';
import 'semantic-ui-css/components/icon.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import '../style/custom.scss';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

export default function AnnotationStudio({ Component, pageProps }) {
  const [session, setSession] = useState(pageProps.session);
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} statefulSession={session} updateSession={setSession} />
    </Provider>
  );
}
