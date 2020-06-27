import Head from 'next/head';
import {
  Container,
} from 'react-bootstrap';
import Layout from '../components/Layout';
import Header from '../components/Header';

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Annotation Studio</title>
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>
      <Header />
      <Container>
        Welcome to Annotation Studio.
      </Container>
    </Layout>
  );
}
