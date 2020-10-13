import { useSession } from 'next-auth/client';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DocumentForm from '../../../components/DocumentForm';

import { prefetchDocumentBySlug } from '../../../utils/docUtil';

const EditDocument = (props) => {
  const { document, alerts } = props;
  const [session] = useSession();
  return (
    <Layout alerts={alerts} type="document" title={document ? `Edit Document: ${document.title}` : 'error'}>
      <Col lg="12" className="mx-auto">
        <Card>
          {!session && (
            <LoadingSpinner />
          )}
          {session && document && (
            <>
              <Card.Header><Card.Title>Edit document</Card.Title></Card.Header>
              <Card.Body>
                <DocumentForm mode="edit" session={session} data={document} />
              </Card.Body>
            </>
          )}
          {session && !document && (
            <>
              <Card.Header><Card.Title>Document not found</Card.Title></Card.Header>
              <Card.Body>Sorry, this document could not be found.</Card.Body>
            </>
          )}
        </Card>
      </Col>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  let props = {};
  await prefetchDocumentBySlug(slug, context.req.headers.cookie).then((response) => {
    props = {
      document: {
        slug,
        ...response,
      },
    };
  }).catch((err) => {
    props = {
      alerts: [{ text: err.message, variant: 'danger' }],
    };
  });

  return { props };
}

export default EditDocument;
