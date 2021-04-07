/* eslint-disable no-underscore-dangle */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Badge, Card, Col, ListGroup, Row, Tab, Tabs,
} from 'react-bootstrap';
import { format } from 'date-fns';
import ReactHtmlParser from 'react-html-parser';
import LoadingSpinner from '../../LoadingSpinner';
import { getSharedAnnotations, getOwnAnnotations, addGroupNamesToAnnotations } from '../../../utils/annotationUtil';
import { FirstNameLastInitial } from '../../../utils/nameUtil';
import { fixIframes } from '../../../utils/parseUtil';
import Paginator from '../../Paginator';

const DashboardAnnotationList = ({
  session,
  setAlerts,
  tab,
  mode,
}) => {
  const [key, setKey] = useState(tab || 'mine');
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [annotations, setAnnotations] = useState([]);
  const limit = mode === 'dashboard' ? 10 : undefined;
  const perPage = 10;

  const fetchData = async ({ effect }) => {
    if (session) {
      setListLoading(true);
      if (effect !== 'page') setPage(1);
      if (session && (session.user.groups || session.user.id)) {
        if (key === 'shared') {
          if (session.user.groups && session.user.groups.length > 0) {
            await getSharedAnnotations({
              groups: session.user.groups, limit, page, perPage,
            })
              .then(async (data) => {
                await addGroupNamesToAnnotations(data.annotations)
                  .then((annosWithGroupNames) => {
                    setTotalPages(Math.ceil((data.count) / perPage));
                    setAnnotations(annosWithGroupNames);
                  });
              })
              .catch((err) => {
                setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                setListLoading(false);
              });
          } else {
            setAnnotations([]);
          }
        } else if (key === 'mine') {
          await getOwnAnnotations({
            userId: session.user.id, limit, page, perPage,
          })
            .then(async (data) => {
              await addGroupNamesToAnnotations(data.annotations)
                .then((annosWithGroupNames) => {
                  setTotalPages(Math.ceil((data.count) / perPage));
                  setAnnotations(annosWithGroupNames);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        }
      }
    }
  };

  useEffect(() => { fetchData({ effect: 'key' }); }, [key, session]);
  useEffect(() => { fetchData({ effect: 'page' }); }, [page]);

  useEffect(() => {
    if (session && annotations) {
      setListLoading(false);
    }
  }, [annotations]);

  return (
    <Card data-testid="dash-annotation-list">
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
      {!listLoading && annotations && annotations.length > 0 && (
      <>
        <ListGroup>
          {annotations.sort((a, b) => new Date(b.created) - new Date(a.created)).map(
            (annotation) => (
              <ListGroup.Item key={annotation._id}>
                <Row>
                  <Col className="ellipsis" xl={8}>
                    <Link href={`/documents/${annotation.target.document.slug}?mine=${key === 'mine'}&aid=${annotation._id}`}>
                      {annotation.target.selector.exact}
                    </Link>
                  </Col>
                  <Col className="text-right" xl={4}>
                    <small style={{ whiteSpace: 'nowrap' }}>{format(new Date(annotation.created), 'Ppp')}</small>
                  </Col>
                </Row>
                <Row>
                  <Col className="paragraph-ellipsis">
                    {ReactHtmlParser(annotation.body.value, { transform: fixIframes })}
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
                      && annotation.permissions.private === false
                      && annotation.permissions.sharedTo === undefined
                      && (
                      <Badge
                        variant="primary"
                        key={annotation.permissions.groups.sort()[0]._id}
                        className="mL-2"
                      >
                        {annotation.permissions.groups.sort()[0].name}
                      </Badge>
                      )}
                    </small>
                  </Col>
                </Row>
              </ListGroup.Item>
            ),
          )}
        </ListGroup>
        {mode === 'list' && (
          <div className="mt-3">
            <Paginator
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />
          </div>
        )}
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
