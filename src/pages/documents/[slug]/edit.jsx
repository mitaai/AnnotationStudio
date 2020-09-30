import { useSession } from 'next-auth/client';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import DocumentForm from '../../../components/DocumentForm';

const EditDocument = (props) => {
  const { document } = props;
  const [session] = useSession();
  return (
    <Layout>
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
  const url = `${process.env.SITE}/api/document/slug/${slug}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: context.req.headers.cookie,
    },
  });
  if (res.status === 200) {
    const foundDoc = await res.json();
    const document = {
      slug,
      ...foundDoc,
    };
    return {
      props: { document },
    };
  }
  return {
    props: { },
  };
}

export default EditDocument;
