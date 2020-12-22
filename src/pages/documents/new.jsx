import { useSession } from 'next-auth/client';
import React, { useState } from 'react';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import DocumentForm from '../../components/DocumentForm';

const NewDocument = ({ statefulSession }) => {
  const [session] = useSession();
  const [errors, setErrors] = useState([]);
  return (
    <Layout alerts={errors} type="document" title="New Document" statefulSession={statefulSession}>
      <Col lg="12" className="mx-auto">
        <Card>
          {!session && (
            <LoadingSpinner />
          )}
          {session && (
            <>
              <Card.Header><Card.Title>Create a new document</Card.Title></Card.Header>
              <Card.Body>
                <DocumentForm mode="new" session={session} setErrors={setErrors} />
              </Card.Body>
            </>
          )}
        </Card>
      </Col>
    </Layout>
  );
};

export default NewDocument;
