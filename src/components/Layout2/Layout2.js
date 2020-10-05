import Head from 'next/head';
import Header from '../Header';
import Footer from '../Footer';
import Alerts from '../Alerts';

function Layout2({ children, type }) {
  return (
    <>
      <Head>
        <title>Annotation Studio</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <Header type={type || 'normal'} />
      <main role="main" className="flex-shrink-0 p-3">
        <Alerts />
        {children}
      </main>
      <Footer />
      <style jsx global>
        {`
          html,
          body,
          #__next {
            height: 100% !important
          }
          body {
            background-color: #eee;
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

export default Layout2;
