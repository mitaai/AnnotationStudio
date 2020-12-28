/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Badge, Button, Card, Col, ListGroup, Row, Tab, Tabs,
} from 'react-bootstrap';
import { format } from 'date-fns';
import LoadingSpinner from '../../LoadingSpinner';
import { getSharedDocumentsByGroup, getDocumentsByUser } from '../../../utils/docUtil';
import { getGroupNameById } from '../../../utils/groupUtil';

const DashboardDocumentList = ({
  session,
  alerts,
  setAlerts,
}) => {
  const [documentGroupState, setDocumentGroupState] = useState({});
  const [key, setKey] = useState('shared');
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        if (key === 'shared') {
          const docs = await getSharedDocumentsByGroup(session.user.groups, 10);
          setDocuments(docs);
        } else if (key === 'mine') {
          const docs = await getDocumentsByUser(session.user.id, 10);
          setDocuments(docs);
        }
      }
    }
    fetchData()
      .then(setListLoading(false))
      .catch((err) => {
        setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
        setListLoading(false);
      });
  }, [key]);


  useEffect(() => {
    if (documents) {
      const fetchGroupState = async () => {
        documents.map((document) => document.groups.map(async (group) => {
          if (!documentGroupState[group]) {
            const name = await getGroupNameById(group);
            setDocumentGroupState((prevState) => ({
              ...prevState,
              [group]: name,
            }));
          }
        }));
      };
      fetchGroupState();
    }
  }, [documents, documentGroupState]);

  return (
    <Card data-testid="dash-document-list">
      <Card.Header>
        <Card.Title><Link href="/documents">Documents</Link></Card.Title>
        <Tabs
          transition={false}
          style={{ justifyContent: 'flex-end', float: 'right', marginTop: '-2rem' }}
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
      </Card.Header>
      {listLoading && (
        <LoadingSpinner />
      )}
      {!listLoading && documents && documents.length > 0 && (
      <ListGroup>
        {documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(
          (document) => (
            <ListGroup.Item key={document.slug}>
              <Row>
                <Col>
                  <Link href={`/documents/${document.slug}`}>{document.title}</Link>
                </Col>
                <Col className="text-right">
                  {document.groups && document.groups.length > 0 && (
                  <Badge
                    variant="info"
                    key={document.groups.sort()[0]}
                    className="mr-2"
                  >
                    {documentGroupState[document.groups.sort()[0]]}
                  </Badge>
                  )}
                  <>
                    {format(new Date(document.createdAt), 'MM/dd/yyyy')}
                  </>
                </Col>
              </Row>
            </ListGroup.Item>
          ),
        )}
        <ListGroup.Item style={{ fontWeight: 'bold' }} key="all-docs">
          <Link href={`/documents?tab=${key}`}>
            {`See all ${key === 'shared' ? key : 'created'} documents...`}
          </Link>
        </ListGroup.Item>
      </ListGroup>
      )}
      {!listLoading && (!documents || documents.length === 0) && (
        <Card.Body>
          {`You have no ${key === 'shared' ? key : 'created'} documents.`}
        </Card.Body>
      )}
      <Card.Footer className="text-right" style={{ borderTop: 0 }}>
        <Button
          size="sm"
          variant="outline-primary"
          href="/documents/new"
        >
          + Create new document
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default DashboardDocumentList;
