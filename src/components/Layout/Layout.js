import Head from 'next/head';
import { Container } from 'react-bootstrap';
import Header from '../Header';
import Footer from '../Footer';
import Alerts from '../Alerts';

function Layout({
  children,
  type,
  document,
  breadcrumbs,
  alerts,
  docView,
  annotations,
  newReg,
  statefulSession,
  dashboardState = '',
}) {
  const content = (
    <>
      {alerts && (<Alerts alerts={alerts} />)}
      {children}
    </>
  );
  let innerContent;
  if (docView) {
    innerContent = content;
  } else if (type === 'dashboard') {
    innerContent = content;
  } else {
    innerContent = <Container>{content}</Container>;
  }
  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_SITE_NAME || 'Annotation Studio'}</title>
        <link rel="icon" href="/as-logo-32x32.png" />
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header
          type={type}
          document={document}
          breadcrumbs={breadcrumbs}
          docView={docView}
          annotations={annotations}
          newReg={newReg}
          statefulSession={statefulSession}
          dashboardState={dashboardState}
        />
        <div style={{ flex: 1, overflowY: 'overlay', paddingTop: docView ? 0 : 15 }}>
          {innerContent}
        </div>
        {!docView && <Footer />}
      </div>
      <style jsx global>
        {`
          html,
          body,
          #__next {
            height: 100% !important
          }
          body {
            background-color: #f5f5f5;
          }
          #__next {
            flex-direction: column !important;
            display: flex !important;        
          }
        `}
      </style>
    </>
  );
}

export default Layout;
