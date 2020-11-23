import { useState } from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import {
  Button, Card, CardColumns, Col, Row,
} from 'react-bootstrap';
import fetch from 'isomorphic-unfetch';
import { useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { addUserToGroup } from '../utils/groupUtil';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardAnnotationList from '../components/Dashboard/DashboardAnnotationList';
import DashboardDocumentList from '../components/Dashboard/DashboardDocumentList';
import DashboardGroupList from '../components/Dashboard/DashboardGroupList';

export default function Home({
  query,
  initAlerts,
  groupId,
  statefulSession,
}) {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);
  const router = useRouter();
  const { alert } = query;
  const newReg = alert && alert === 'completeRegistration';

  return (
    <Layout alerts={alerts} type="dashboard" newReg={newReg} statefulSession={statefulSession}>
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {!session && !loading && (
      <Card>
        <Card.Header><Card.Title>Welcome to Annotation Studio</Card.Title></Card.Header>
        <Card.Body>Welcome to Annotation Studio. Please log in to use the application.</Card.Body>
      </Card>
      )}
      {session && !session.user.firstName && !statefulSession && (
        <Card>
          <Card.Header><Card.Title>Please complete registration</Card.Title></Card.Header>
          <Card.Body>
            <p>
              Please complete your registration by
              {' '}
              <Link href="/user/newuser">clicking here</Link>
              .
            </p>
            <p>
              If you believe you already have compelted registration and this message is in
              error, try
              <Button
                size="sm"
                variant="link"
                onClick={() => router.reload()}
                style={{ padding: '0 0 0 3px', fontSize: '12pt', marginBottom: '4px' }}
              >
                refreshing the page
              </Button>
              .
            </p>
          </Card.Body>
        </Card>
      )}
      {session && (session.user.firstName || statefulSession) && !loading && (
        <Row>
          <Col>
            <CardColumns style={{ columnCount: 1 }}>
              <DashboardDocumentList
                session={session}
                alerts={alerts}
                setAlerts={setAlerts}
              />
              <DashboardGroupList
                session={session}
              />
            </CardColumns>
          </Col>
          <Col>
            <DashboardAnnotationList
              session={session}
              alerts={alerts}
              setAlerts={setAlerts}
              mode="dashboard"
            />
          </Col>
        </Row>
      )}
      {session && !loading && groupId && groupId !== '' && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
          <Card.Header>Join Group</Card.Header>
          <Card.Body>
            You have been invited to join a group.
            <br />
            <Button
              className="mt-3"
              onClick={() => {
                destroyCookie(null, 'ans_grouptoken', {
                  path: '/',
                });
                addUserToGroup({ id: groupId }, session.user.email).then(() => {
                  setAlerts([...alerts, { text: 'Group successfully joined', variant: 'success' }]);
                }).catch((err) => {
                  setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
                });
              }}
            >
              Join Group
            </Button>
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
}

Home.getInitialProps = async (context) => {
  const { query } = context;
  const cookies = parseCookies(context);
  const {
    statefulSession,
  } = query;
  let groupId = '';
  let initAlerts = [];
  if (query.alert === 'completeRegistration') {
    initAlerts = [{
      text: 'You have successfully registered for Annotation Studio. Welcome!',
      variant: 'success',
    }];
    destroyCookie(context, 'ans_grouptoken', {
      path: '/',
    });
  } else if (cookies.ans_grouptoken) {
    const url = `${process.env.SITE}/api/invite/${cookies.ans_grouptoken}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      groupId = result.group;
    }
  } else if (query.alert === 'joinedGroup') {
    initAlerts = [{
      text: 'Group successfully joined.',
      variant: 'success',
    }];
  }
  const returnObj = {
    query,
    groupId,
    initAlerts,
    statefulSession,
  };
  return returnObj;
};
