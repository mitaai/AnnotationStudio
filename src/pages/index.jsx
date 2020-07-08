import { useState } from 'react';
import {
  Alert, Container,
} from 'react-bootstrap';
import Layout from '../components/Layout';

export default function Home({ query }) {
  const [show, setShow] = useState(true);
  const { regComplete } = query;
  return (
    <Layout>
      <Container>
        {regComplete === 'true' && show && (
          <Alert variant="success" onClose={() => setShow(false)} dismissible>
            You have successfully registered for Annotation Studio. Welcome!
          </Alert>
        )}
        Welcome to Annotation Studio.
      </Container>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  return {
    props: { query: context.query }, // will be passed to the page component as props
  };
}
