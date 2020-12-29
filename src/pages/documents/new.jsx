import { useSession } from 'next-auth/client';
import React, { useState, useEffect } from 'react';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../components/Layout';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import DocumentForm from '../../components/DocumentForm';

const NewDocument = ({ statefulSession }) => {
  const [session, loading] = useSession();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading === false) {
      setPageLoading(false);
    }
  }, [loading]);

  const [errors, setErrors] = useState([]);
  return (
    <Layout alerts={errors} type="document" title="New Document" statefulSession={statefulSession}>
      <Col lg="12" className="mx-auto">
        <Card>
          {((!session && loading) || (session && pageLoading)) && (
            <LoadingSpinner />
          )}
          {!session && !loading && (
            <UnauthorizedCard />
          )}
          {session && !loading && !pageLoading && (
            <>
              <Card.Header><Card.Title>Create a new document</Card.Title></Card.Header>
              <Card.Body>
                <DocumentForm
                  mode="new"
                  session={session}
                  setErrors={setErrors}
                  setPageLoading={setPageLoading}
                />
              </Card.Body>
            </>
          )}
        </Card>
      </Col>
    </Layout>
  );
};

export default NewDocument;
