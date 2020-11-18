import { useState } from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import {
  Button, Card, CardColumns, Col, Row,
} from 'react-bootstrap';
import fetch from 'isomorphic-unfetch';
import { useSession } from 'next-auth/client';
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
}) {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);

  return (
    <Layout alerts={alerts} type="dashboard" newReg={query.alert === 'completeRegistration'}>
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
      {session && !loading && (
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
  return {
    query,
    groupId,
    initAlerts,
  };
};
