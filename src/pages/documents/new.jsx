import { useSession } from 'next-auth/client';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import DocumentForm from '../../components/DocumentForm';

const NewDocument = () => {
  const [session] = useSession();
  return (
    <Layout type="document" title="New Document">
      <Col lg="12" className="mx-auto">
        <Card>
          {!session && (
            <LoadingSpinner />
          )}
          {session && (
            <>
              <Card.Header><Card.Title>Create a new document</Card.Title></Card.Header>
              <Card.Body>
                <DocumentForm mode="new" session={session} />
              </Card.Body>
            </>
          )}
        </Card>
      </Col>
    </Layout>
  );
};

export default NewDocument;
