/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Badge, Card, Col, ListGroup, Row, Tab, Tabs,
} from 'react-bootstrap';
import { format } from 'date-fns';
import LoadingSpinner from '../../LoadingSpinner';
import { getSharedAnnotations, getOwnAnnotations } from '../../../utils/annotationUtil';
import { getGroupNameById } from '../../../utils/groupUtil';
import { FirstNameLastInitial } from '../../../utils/nameUtil';

const DashboardAnnotationList = ({
  session,
  alerts,
  setAlerts,
  tab,
  mode,
}) => {
  const [annotationsGroupState, setAnnotationsGroupState] = useState({});
  const [key, setKey] = useState(tab || 'mine');
  const [listLoading, setListLoading] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const limit = mode === 'dashboard' ? 10 : undefined;

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        if (key === 'shared') {
          if (session.user.groups && session.user.groups.length > 0) {
            setAnnotations(
              await getSharedAnnotations(session.user.groups, limit)
                .then(setListLoading(false))
                .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }])),
            );
          } else {
            setAnnotations([]);
          }
        } else if (key === 'mine') {
          setAnnotations(
            await getOwnAnnotations(session.user.id, limit)
              .then(setListLoading(false))
              .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }])),
          );
        }
      }
    }
    fetchData();
  }, [key]);


  useEffect(() => {
    if (annotations) {
      const fetchGroupState = async () => {
        annotations.map((annotation) => annotation.permissions.groups.map(async (group) => {
          if (!annotationsGroupState[group]) {
            const name = await getGroupNameById(group);
            setAnnotationsGroupState((prevState) => ({
              ...prevState,
              [group]: name,
            }));
          }
        }));
      };
      fetchGroupState();
    }
  }, [annotations]);

  return (
    <Card>
      <Card.Header>
        <Card.Title>
          {mode === 'dashboard' && (
            <Link href="/annotations">Annotations</Link>
          )}
          {mode === 'list' && (
            <>Annotations</>
          )}
        </Card.Title>
        <Tabs
          transition={false}
          style={{ justifyContent: 'flex-end', float: 'right', marginTop: '-2rem' }}
          activeKey={key}
          onSelect={(k) => setKey(k)}
        >
          <Tab eventKey="shared" title="Shared" />
          <Tab eventKey="mine" title="Mine" />
        </Tabs>
      </Card.Header>
      {listLoading && (
        <LoadingSpinner />
      )}
      {!listLoading && annotations && annotations.length > 0 && (
      <>
        <ListGroup>
          {annotations.sort((a, b) => new Date(b.created) - new Date(a.created)).map(
            (annotation) => (
              <ListGroup.Item key={annotation._id}>
                <Row>
                  <Col className="ellipsis" xl={8}>
                    <Link href={`/documents/${annotation.target.document.slug}?mine=${key === 'mine'}#${annotation._id}`}>
                      {annotation.target.selector.exact}
                    </Link>
                  </Col>
                  <Col className="text-right" xl={4}>
                    <small style={{ whiteSpace: 'nowrap' }}>{format(new Date(annotation.created), 'Ppp')}</small>
                  </Col>
                </Row>
                <Row>
                  <Col className="paragraph-ellipsis">
                    {annotation.body.value}
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <small className="text-muted">
                      {annotation.target.document.title}
                      {' ('}
                      {FirstNameLastInitial(annotation.creator.name)}
                      {') '}
                      {annotation.permissions.groups
                      && annotation.permissions.groups.length > 0
                      && annotation.permissions.private === false && (
                      <Badge
                        variant="info"
                        key={annotation.permissions.groups.sort()[0]}
                        className="mL-2"
                      >
                        {annotationsGroupState[annotation.permissions.groups.sort()[0]]}
                      </Badge>
                      )}
                    </small>
                  </Col>
                </Row>
              </ListGroup.Item>
            ),
          )}
        </ListGroup>
        {mode === 'dashboard' && (
        <Card.Footer style={{ fontWeight: 'bold', borderTop: 0 }} key="all-annotations">
          <Link href={`/annotations?tab=${key}`} disabled>
            {`See all ${key === 'shared' ? key : 'created'} annotations...`}
          </Link>
        </Card.Footer>
        )}
      </>
      )}
      {!listLoading && (!annotations || annotations.length === 0) && (
        <Card.Body>
          {`You have no ${key === 'shared' ? key : 'created'} annotations.`}
        </Card.Body>
      )}
    </Card>
  );
};

export default DashboardAnnotationList;