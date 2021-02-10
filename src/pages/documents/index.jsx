import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import {
  Button, Card, Container, Tabs, Tab,
} from 'react-bootstrap';
import Layout from '../../components/Layout';
import DocumentList from '../../components/DocumentList';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import { getSharedDocumentsByGroup, getDocumentsByUser, addGroupNamesToDocuments } from '../../utils/docUtil';

const DocumentsIndex = ({
  props,
  statefulSession,
}) => {
  const { tab, initAlert } = props;
  const [session, loading] = useSession();
  const [key, setKey] = tab ? useState(tab) : useState('shared');
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [alerts, setAlerts] = initAlert ? useState([initAlert]) : useState([]);

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        if (key === 'shared') {
          getSharedDocumentsByGroup(session.user.groups)
            .then(async (docs) => {
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(docsWithGroupNames);
                  setListLoading(false);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        } else if (key === 'mine') {
          await getDocumentsByUser(session.user.id)
            .then(async (docs) => {
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(docsWithGroupNames);
                  setListLoading(false);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        }
      }
    }
    fetchData();
  }, [session, key]);

  return (
    <Layout alerts={alerts} type="document" statefulSession={statefulSession}>
      {((loading && !session) || (session && listLoading)) && (
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
      {!loading && !session && (
        <UnauthorizedCard />
      )}
      {!loading && session && !listLoading && (
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
            onSelect={(k) => {
              if (k !== key) {
                setListLoading(true);
              }
              setKey(k);
            }}
          >
            <Tab eventKey="shared" title="Shared" />
            <Tab eventKey="mine" title="Mine" />
          </Tabs>
          {Array.isArray(documents) && documents.length > 0 && (
            <DocumentList
              documents={documents}
              setDocuments={setDocuments}
              alerts={alerts}
              setAlerts={setAlerts}
              loading={listLoading}
              setLoading={setListLoading}
              userGroups={session.user.groups}
              userId={session.user.id}
            />
          )}
          {(!Array.isArray(documents) || documents.length === 0) && (
            <Container fluid className="p-3 mb-3 border">
              {`You have no ${key === 'shared' ? key : 'created'} documents.`}
            </Container>
          )}
          <Button href="/documents/new">
            Create New Document
          </Button>
        </Card.Body>
      </Card>
      )}
    </Layout>
  );
};

DocumentsIndex.getInitialProps = async (context) => {
  const { tab, alert } = context.query;
  let props = {};
  if (tab) props = { ...props, tab };
  if (alert && ['editedDocument', 'createdDocument', 'deletedDocument'].includes(alert)) {
    let text = '';
    switch (alert) {
      case 'editedDocument': text = 'Document edited successfully.'; break;
      case 'createdDocument': text = 'Document created successfully.'; break;
      case 'deletedDocument': text = 'Document deleted successfully.'; break;
      default: text = '';
    }
    const initAlert = {
      text,
      variant: alert === 'deletedDocument' ? 'warning' : 'success',
    };
    props = { ...props, initAlert };
  }
  return { props };
};

export default DocumentsIndex;
