/* eslint-disable react/jsx-props-no-spreading */
import { useState, useCallback, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { SessionProvider } from 'next-auth/react';
import {
  WebsocketContext
} from '../contexts/DocumentContext';
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

  const [socketUrl, setSocketUrl] = useState('wss://wq5pn518mf.execute-api.us-east-2.amazonaws.com/dev/');
  const [messageHistory, setMessageHistory] = useState([]);

  const {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    lastJsonMessage,
    readyState,
    getWebSocket,
  } = useWebSocket(socketUrl, {
    onOpen: () => console.log('opened'),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];


  const handleSendJsonMessage = useCallback((json) => sendJsonMessage(json), []);
  

  useEffect(() => {
    if (lastJsonMessage !== null) {
      // console.log('lastJsonMessage: ', lastJsonMessage)
      setMessageHistory((prev) => prev.concat(lastJsonMessage));
    }
  }, [lastJsonMessage, setMessageHistory]);

  return (
    <SessionProvider session={pageProps.session}>
      <WebsocketContext.Provider value={[messageHistory, setMessageHistory, handleSendJsonMessage, lastJsonMessage, readyState, connectionStatus, getWebSocket]}>
        <Component {...pageProps} statefulSession={session} updateSession={setSession} />
      </WebsocketContext.Provider>
    </SessionProvider>
  );
}
