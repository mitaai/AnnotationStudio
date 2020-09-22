import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import { Card, Tabs, Tab } from 'react-bootstrap';
import Layout from '../../components/Layout';
import DocumentList from '../../components/DocumentList';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getDocumentsByGroup, getDocumentsByUser } from '../../utils/docUtil';

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
            await getDocumentsByGroup(session.user.groups)
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
        <Card.Body>
          <LoadingSpinner />
        </Card.Body>
      </Card>
      )}
      {!loading && session && (
      <Tabs
        transition={false}
        id="document-list-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        <Tab eventKey="shared" title="Shared">
          <DocumentList documents={documents} loading={listLoading} />
        </Tab>
        <Tab eventKey="mine" title="Mine">
          <DocumentList documents={documents} loading={listLoading} />
        </Tab>
      </Tabs>
      )}
    </Layout>
  );
};

export default DocumentsIndex;
