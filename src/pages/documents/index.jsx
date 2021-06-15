/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  getSharedDocumentsByGroup,
  getDocumentsByUser,
  addGroupNamesToDocuments,
  getDocumentsByGroupByUser,
} from '../../utils/docUtil';
import Paginator from '../../components/Paginator';
import styles from '../../style/pages/DocumentsIndex.module.scss';
import TileBadge from '../../components/TileBadge';

const DocumentsIndex = ({
  props,
  query,
  statefulSession,
}) => {
  const dashboardState = `${query.did !== undefined && query.slug !== undefined ? `did=${query.did}&slug=${query.slug}&dp=${query.dp}&` : ''}gid=${query.gid}`;

  const { tab, initAlert } = props;
  const [session, loading] = useSession();
  const tabToUse = tab || 'shared';
  const isPrivateGroup = query && query.gid === 'privateGroup';
  const [key, setKey] = useState(tabToUse);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState(undefined);
  const alertArray = initAlert ? [initAlert] : [];
  const [alerts, setAlerts] = useState(alertArray);
  const perPage = 8;

  let breadcrumbs;
  let validGroupId = false;
  if (session !== undefined && query) {
    const group = session.user.groups.find(({ id }) => id === query.gid);
    validGroupId = group !== undefined || query.gid === 'privateGroup';
    if (group !== undefined) {
      breadcrumbs = [
        { name: group.name, href: `/groups/${query.gid}` },
        { name: 'Documents' },
      ];
    } else if (validGroupId) {
      // the only way group can be undefined but still be a validGroupId is if it is the psuedo
      // privateGroup
      breadcrumbs = [
        { name: 'Private Group' },
        { name: 'Documents' },
      ];
    }
  }

  const fetchData = async () => {
    if (session) {
      setListLoading(true);
      if (validGroupId) {
        if (key === 'shared') {
          await getDocumentsByGroupByUser({
            groups: [{ id: query.gid }],
            page,
            perPage,
            mine: false,
          })
            .then(async (data) => {
              const { count, docs } = data;
              setTotalPages(Math.ceil((count) / perPage));
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(docsWithGroupNames);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        } else if (key === 'mine') {
          await getDocumentsByGroupByUser({
            groups: query.gid === 'privateGroup' ? [] : [{ id: query.gid }],
            id: session.user.id,
            page,
            perPage,
            mine: true,
          })
            .then(async (data) => {
              const { count, docs } = data;
              setTotalPages(Math.ceil((count) / perPage));
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(docsWithGroupNames);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        }
      } else if (key === 'shared') {
        await getSharedDocumentsByGroup({ groups: session.user.groups, page, perPage })
          .then(async (data) => {
            const { count, docs } = data;
            setTotalPages(Math.ceil((count) / perPage));
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                setDocuments(docsWithGroupNames);
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
            setTotalPages(Math.ceil((count) / perPage));
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                setDocuments(docsWithGroupNames);
              });
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      }
    }
  };


  useEffect(() => {
    if (page !== 1) { setPage(1); } else { fetchData(); }
  }, [key, session]);
  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => {
    if (session && documents) {
      setListLoading(false);
    }
  }, [documents]);

  const cardTitle = breadcrumbs === undefined ? 'Documents' : (
    <>
      Documents from
      {' '}
      <TileBadge key="selectedGroup" color="blue" fontSize={18} text={breadcrumbs[0].name} />
    </>
  );

  return (
    <Layout
      alerts={alerts}
      type="document"
      breadcrumbs={breadcrumbs}
      statefulSession={statefulSession}
      dashboardState={dashboardState}
    >
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
        <Card.Header className={styles.header}>
          <Card.Title>
            {cardTitle}
          </Card.Title>
          <div className={styles.tabs}>
            <Tabs
              transition={false}
              activeKey={key}
              onSelect={(k) => {
                setKey(k);
              }}
            >
              {!isPrivateGroup && <Tab eventKey="shared" title="Shared" />}
              <Tab eventKey="mine" title="Mine" />
            </Tabs>
          </div>
        </Card.Header>
        <Card.Body>
          <div className={styles['button-container']}>
            <Button href="/documents/new" className="mb-3" size="sm" variant="outline-primary">
              <Plus className="mr-1 ml-n1 mt-n1" />
              Create New Document
            </Button>
          </div>
          {Array.isArray(documents) && documents.length > 0 && (
            <>
              <DocumentList
                documents={documents}
                setDocuments={setDocuments}
                selectedGroupId={breadcrumbs ? query.gid : undefined}
                alerts={alerts}
                setAlerts={setAlerts}
                loading={listLoading}
                setLoading={setListLoading}
                userGroups={session.user.groups}
                userId={session.user.id}
              />
              <Paginator
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
            </>
          )}
          {(!Array.isArray(documents) || documents.length === 0) && (
            <Container fluid className="p-3 mb-3 border">
              {`You have no ${key === 'shared' ? key : 'created'} documents.`}
            </Container>
          )}
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
  return { props, query: context.query };
};

export default DocumentsIndex;
