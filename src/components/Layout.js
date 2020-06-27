import Head from 'next/head';
import Header from './Header';

function Layout({ children }) {
  return (
    <>
      <Head>
        <title>Annotation Studio</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <Header />
      {children}
    </>
  );
}

export default Layout;
