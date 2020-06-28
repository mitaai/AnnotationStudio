import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Annotation Studio</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <Header />
      <main role="main" className="flex-shrink-0">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default Layout;
