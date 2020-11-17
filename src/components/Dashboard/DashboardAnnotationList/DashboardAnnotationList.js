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
}) => {
  const [groupState, setGroupState] = useState({});
  const [key, setKey] = useState('mine');
  const [listLoading, setListLoading] = useState(true);
  const [annotations, setAnnotations] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        if (key === 'shared') {
          setAnnotations(
            await getSharedAnnotations(session.user.groups, 10)
              .then(setListLoading(false))
              .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }])),
          );
        } else if (key === 'mine') {
          setAnnotations(
            await getOwnAnnotations(session.user.id, 10)
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
          if (!groupState[group]) {
            setGroupState({ ...groupState, [group]: await getGroupNameById(group) });
          }
        }));
      };
      fetchGroupState();
    }
  }, [annotations, groupState]);

  return (
    <Card>
      <Card.Header>
        <Card.Title><Link href="/annotations">Annotations</Link></Card.Title>
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
                    {annotation.permissions.groups && annotation.permissions.groups.length > 0 && (
                    <Badge
                      variant="info"
                      key={annotation.permissions.groups.sort()[0]}
                      className="mr-2"
                    >
                      {groupState[annotation.permissions.groups.sort()[0]]}
                    </Badge>
                    )}
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
                      )
                    </small>
                  </Col>
                </Row>
              </ListGroup.Item>
            ),
          )}
        </ListGroup>
        <Card.Footer style={{ fontWeight: 'bold', borderTop: 0 }} key="all-annotations">
          <Link href={`/annotations?tab=${key}`} disabled>
            {`See all ${key === 'shared' ? key : 'created'} annotations...`}
          </Link>
        </Card.Footer>
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
