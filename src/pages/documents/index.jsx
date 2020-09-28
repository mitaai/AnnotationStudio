import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import {
  Button, Card, Container, Tabs, Tab,
} from 'react-bootstrap';
import Layout from '../../components/Layout';
import DocumentList from '../../components/DocumentList';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getSharedDocumentsByGroup, getDocumentsByUser } from '../../utils/docUtil';

const DocumentsIndex = () => {
  const [session, loading] = useSession();
  const [key, setKey] = useState('shared');
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (session) {
        if (key === 'shared') {
          setDocuments(
            await getSharedDocumentsByGroup(session.user.groups)
              .then(setListLoading(false))
              .catch((err) => setAlerts([{ text: err.message, variant: 'danger' }])),
          );
        } else if (key === 'mine') {
          setDocuments(
            await getDocumentsByUser(session.user.id)
              .then(setListLoading(false))
              .catch((err) => setAlerts([{ text: err.message, variant: 'danger' }])),
          );
        }
      }
    }
    fetchData();
  }, [session, key]);

  return (
    <Layout alerts={alerts}>
      {loading && !session && (
      <Card>
        <Card.Header>
          <Card.Title>
            Documents
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <LoadingSpinner />
        </Card.Body>
      </Card>
      )}
      {!loading && session && (
      <Card>
        <Card.Header>
          <Card.Title>
            Documents
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Tabs
            transition={false}
            id="document-list-tabs"
            style={{ justifyContent: 'flex-end', marginBottom: '0', marginRight: '0' }}
            activeKey={key}
            onSelect={(k) => setKey(k)}
          >
            <Tab eventKey="shared" title="Shared">
              {Array.isArray(documents) && documents.length > 0 && (
                <DocumentList
                  documents={documents}
                  loading={listLoading}
                  userId={session.user.id}
                />
              )}
              {(!Array.isArray(documents) || documents.length === 0) && (
                <Container fluid className="p-3 mb-3 border">You have no shared documents.</Container>
              )}
            </Tab>
            <Tab eventKey="mine" title="Mine">
              {Array.isArray(documents) && documents.length > 0 && (
                <DocumentList
                  documents={documents}
                  loading={listLoading}
                  userId={session.user.id}
                />
              )}
              {(!Array.isArray(documents) || documents.length === 0) && (
                <Container fluid className="p-3 mb-3 border">You have no created documents.</Container>
              )}
            </Tab>
          </Tabs>
          <Button href="/documents/new">
            Create New Document
          </Button>
        </Card.Body>
      </Card>
      )}
    </Layout>
  );
};

export default DocumentsIndex;
