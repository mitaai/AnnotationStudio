import { useState } from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import { Button, Card } from 'react-bootstrap';
import fetch from 'isomorphic-unfetch';
import { useSession } from 'next-auth/client';
import Layout from '../components/Layout';
import { AddUserToGroup } from '../utils/groupUtil';

export default function Home({
  initAlerts,
  groupId,
}) {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);

  return (
    <Layout alerts={alerts}>
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
                AddUserToGroup({ id: groupId }, session.user.email).then(() => {
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
      {' '}
      Welcome to Annotation Studio.
    </Layout>
  );
}

Home.getInitialProps = async (context) => {
  const { query } = context;
  const cookies = parseCookies(context);
  let groupId = '';
  let initAlerts = [];
  if (query.alert === 'completeRegistration') {
    destroyCookie(context, 'ans_grouptoken', {
      path: '/',
    });
    initAlerts = [{
      text: 'You have successfully registered for Annotation Studio. Welcome!',
      variant: 'success',
    }];
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
    props: {
      query,
      groupId,
      initAlerts,
    },
  };
};
