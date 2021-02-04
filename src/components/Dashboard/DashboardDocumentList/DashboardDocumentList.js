/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Badge, Button, Card, Col, ListGroup, OverlayTrigger, Row, Tab, Tabs, Tooltip,
} from 'react-bootstrap';
import { Plus } from 'react-bootstrap-icons';
import { format } from 'date-fns';
import LoadingSpinner from '../../LoadingSpinner';
import { getSharedDocumentsByGroup, getDocumentsByUser } from '../../../utils/docUtil';
import { getGroupNameById, filterGroupIdsByUser } from '../../../utils/groupUtil';

const DashboardDocumentList = ({
  session,
  alerts,
  setAlerts,
  forceUpdate,
}) => {
  const [documentGroupState, setDocumentGroupState] = useState({});
  const [key, setKey] = useState('shared');
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        setListLoading(true);
        if (key === 'shared') {
          await getSharedDocumentsByGroup(session.user.groups, 7)
            .then((docs) => {
              setDocuments(docs);
              setListLoading(false);
            }).catch((err) => {
              setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        } else if (key === 'mine') {
          await getDocumentsByUser(session.user.id, 7)
            .then((docs) => {
              setDocuments(docs);
              setListLoading(false);
            }).catch((err) => {
              setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        }
      }
    }
    fetchData();
  }, [key, forceUpdate]);


  useEffect(() => {
    if (documents) {
      const fetchGroupState = async () => {
        documents.map((document) => document.groups.map(async (group) => {
          if (!documentGroupState[group]) {
            const name = await getGroupNameById(group)
              .catch((err) => {
                setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
              });
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
    <>
      <Card data-testid="dash-document-list">
        <Card.Header>
          <Card.Title><Link href="/documents">Documents</Link></Card.Title>
          <Tabs
            transition={false}
            style={{ justifyContent: 'flex-end', float: 'right', marginTop: '-2rem' }}
            activeKey={key}
            onSelect={(k) => {
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
                    {session && session.user.groups && document.groups
                    && filterGroupIdsByUser(document.groups, session.user.groups).length > 0 && (
                    <Badge
                      variant="info"
                      key={filterGroupIdsByUser(document.groups, session.user.groups).sort()[0]}
                      className="mr-2"
                    >
                      {documentGroupState[filterGroupIdsByUser(document.groups, session.user.groups)
                        .sort()[0]]}
                    </Badge>
                    )}
                    {document.groups && session && session.user.groups
                    && filterGroupIdsByUser(document.groups, session.user.groups).length > 1 && (
                      <OverlayTrigger
                        overlay={(
                          <Tooltip id="tooltip-groups">
                            Shared with additional groups
                          </Tooltip>
                        )}
                        placement="top"
                      >
                        <Plus
                          className="mr-1 ml-n1 mb-1"
                          title="Tooltip on left"
                        />
                      </OverlayTrigger>
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
        {!listLoading && documents && documents.length === 0 && (
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
      <style jsx global>
        {`
          #tooltip-groups .tooltip-inner {
            font-size: 12px;
            background-color: #f6f6f6;
            color: black;
            border: 1px solid rgba(0, 0, 0, 0.125);
          }
          #tooltip-groups .arrow {
            background-color: transparent;
          }
          #tooltip-groups .arrow::before {
            border-top-color: rgba(0, 0, 0, 0.125);
          }
        `}
      </style>
    </>
  );
};

export default DashboardDocumentList;
