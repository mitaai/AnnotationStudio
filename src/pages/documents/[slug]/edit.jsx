import { useSession } from 'next-auth/client';
import React, { useState, useEffect } from 'react';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import UnauthorizedCard from '../../../components/UnauthorizedCard';
import DocumentForm from '../../../components/DocumentForm';

import { prefetchDocumentBySlug } from '../../../utils/docUtil';

const EditDocument = ({ document, alerts, statefulSession }) => {
  const [session, loading] = useSession();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading === false) {
      setPageLoading(false);
    }
  }, [loading]);
  const [errors, setErrors] = useState(alerts || []);
  return (
    <Layout alerts={errors} type="document" title={document ? `Edit Document: ${document.title}` : 'error'} statefulSession={statefulSession}>
      <Col lg="12" className="mx-auto">
        <Card>
          {((!session && loading) || (session && pageLoading)) && (
            <LoadingSpinner />
          )}
          {!session && !loading && (
            <UnauthorizedCard />
          )}
          {session && document && !loading && !pageLoading && (
            <>
              <Card.Header><Card.Title>Edit document</Card.Title></Card.Header>
              <Card.Body>
                <DocumentForm
                  mode="edit"
                  session={session}
                  data={document}
                  setErrors={setErrors}
                  errors={errors}
                  setPageLoading={setPageLoading}
                />
              </Card.Body>
            </>
          )}
          {session && !document && !loading && !pageLoading && (
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
