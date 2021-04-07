import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/client';
import {
  Button, Card, Container, Tabs, Tab,
} from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import Layout from '../../components/Layout';
import DocumentList from '../../components/DocumentList';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import { getSharedDocumentsByGroup, getDocumentsByUser, addGroupNamesToDocuments } from '../../utils/docUtil';
import Paginator from '../../components/Paginator';
import styles from '../../style/pages/DocumentsIndex.module.scss';

const DocumentsIndex = ({
  props,
  statefulSession,
}) => {
  const { tab, initAlert } = props;
  const [session, loading] = useSession();
  const [key, setKey] = tab ? useState(tab) : useState('shared');
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [alerts, setAlerts] = initAlert ? useState([initAlert]) : useState([]);
  const perPage = 10;

  const fetchData = async ({ effect }) => {
    if (session) {
      setListLoading(true);
      if (effect !== 'page') setPage(1);
      if (key === 'shared') {
        getSharedDocumentsByGroup({ groups: session.user.groups, page, perPage })
          .then(async (data) => {
            const { count, docs } = data;
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                setTotalPages(Math.ceil((count) / perPage));
                setDocuments(docsWithGroupNames);
                setListLoading(false);
              });
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      } else if (key === 'mine') {
        await getDocumentsByUser({ id: session.user.id, page, perPage })
          .then(async (data) => {
            const { count, docs } = data;
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                setTotalPages(Math.ceil((count) / perPage));
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
  };


  useEffect(() => { fetchData({ effect: 'key' }); }, [key, session]);
  useEffect(() => { fetchData({ effect: 'page' }); }, [page]);

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
          <div className={styles['header-first-row']}>
            <Card.Title>
              Documents
            </Card.Title>
            <Button href="/documents/new">
              <Plus className="mr-1 ml-n1 mt-n1" />
              Create New Document
            </Button>
          </div>
          <div className={styles['header-second-row']}>
            <Tabs
              transition={false}
              activeKey={key}
              onSelect={(k) => {
                setKey(k);
              }}
            >
              <Tab eventKey="shared" title="Shared" />
              <Tab eventKey="mine" title="Mine" />
            </Tabs>
          </div>
        </Card.Header>
        <Card.Body>
          {Array.isArray(documents) && documents.length > 0 && (
            <>
              <Paginator
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
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
            </>
          )}
          {(!Array.isArray(documents) || documents.length === 0) && (
            <Container fluid className="p-3 mb-3 border">
              {`You have no ${key === 'shared' ? key : 'created'} documents.`}
            </Container>
          )}
          <Button href="/documents/new">
            <Plus className="mr-1 ml-n1 mt-n1" />
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
