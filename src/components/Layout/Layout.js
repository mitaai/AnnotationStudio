import Head from 'next/head';
import { Container } from 'react-bootstrap';
import Header from '../Header';
import Footer from '../Footer';
import Alerts from '../Alerts';

function Layout({
  children,
  type,
  splashPage,
  getTextAnalysisData,
  document,
  breadcrumbs,
  alerts,
  docView,
  annotations,
  newReg,
  statefulSession,
  dashboardState = '',
  mode,
  setMode,
  backgroundColor,
  noContainer,
  secondNavbarExtraContent,
}) {
  const content = (
    <>
      {alerts && (<Alerts alerts={alerts} />)}
      {children}
    </>
  );

  const innerContent = (docView || type === 'dashboard' || noContainer)
    ? content
    : (
      <Container style={type === 'admin' ? {
        height: '100%',
      } : {}}
      >
        {content}
      </Container>
    );

  return (
    <>
      <Head>
        <title>{process.env.NEXT_PUBLIC_SITE_NAME || 'Annotation Studio'}</title>
        <link rel="icon" href="/as-logo-32x32.png" />
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header
          type={type}
          getTextAnalysisData={getTextAnalysisData}
          document={document}
          breadcrumbs={breadcrumbs}
          docView={docView}
          annotations={annotations}
          newReg={newReg}
          statefulSession={statefulSession}
          dashboardState={dashboardState}
          mode={mode}
          setMode={setMode}
          secondNavbarExtraContent={secondNavbarExtraContent}
        />
        <div style={{
          flex: 1,
          overflowY: docView ? 'hidden' : 'overlay',
          paddingTop: (docView || noContainer) ? 0 : 15,
          backgroundColor,
        }}
        >
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
            background-color: ${splashPage ? 'white' : '#f5f5f5'};
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
