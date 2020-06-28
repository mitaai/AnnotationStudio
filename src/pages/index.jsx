import {
  Container,
} from 'react-bootstrap';
import Layout from '../components/Layout';

export default function Home() {
  return (
    <Layout>
      <Container>
        Welcome to Annotation Studio.
      </Container>
      <style jsx global>
        {`
          html,
          body,
          #__next {
            height: 100% !important
          }
          #__next {
            flex-direction: column !important;
            display: flex !important;        
          }
        `}
      </style>
    </Layout>
  );
}
