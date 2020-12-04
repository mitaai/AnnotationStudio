import { setCookie } from 'nookies';
import React, { useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { csrfToken, useSession, signIn } from 'next-auth/client';
import { Button, Card, Form } from 'react-bootstrap';
import Router from 'next/router';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { addUserToGroup } from '../../utils/groupUtil';

const SignIn = ({ props }) => {
  const [session, loading] = useSession();

  const { csrfToken, groupId, initAlerts } = props; // eslint-disable-line no-shadow
  const [alerts, setAlerts] = useState(initAlerts);
  return (
    <Layout
      type="signin"
      alerts={alerts}
    >
      {!session && loading && (
        <LoadingSpinner />
      )}
      {!session && !loading && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
          <Card.Header>Log In / Sign Up</Card.Header>
          <Card.Body>
            <Form method="post" action="/api/auth/signin/email">
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <Form.Label>With email address</Form.Label>
              <Form.Control name="email" type="email" placeholder="Email address" />
              <Button variant="outline-secondary" type="submit" className="mt-3">
                Submit
              </Button>
            </Form>
            <hr />
            <div key="Google">
              With Google account
              <br />
              <Button onClick={() => signIn('google')} variant="outline-secondary" className="mt-2">
                Sign in with Google
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
      {session && groupId !== '' && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
          <Card.Header>Join Group</Card.Header>
          <Card.Body>
            Click below to join the group:
            <br />
            <Button
              className="mt-3"
              onClick={() => {
                addUserToGroup({ id: groupId }, session.user.email).then(() => {
                  Router.push({
                    pathname: '/',
                    query: { alert: 'joinedGroup' },
                  });
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
      {session && groupId === '' && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
          <Card.Header>Log In / Sign Up</Card.Header>
          <Card.Body>
            You are now logged in.
            <br />
            <Button
              className="mt-3"
              href="/"
            >
              Go to Dashboard
            </Button>
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
};

SignIn.getInitialProps = async (context) => {
  const { groupToken, error } = await context.query;
  let groupId = '';
  let initAlerts = [];
  if (groupToken) {
    setCookie(context, 'ans_grouptoken', groupToken, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });
    const url = `${process.env.SITE}/api/invite/${groupToken}`;
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
  }
  if (error && error === 'OAuthAccountNotLinked') {
    initAlerts = [{
      text: 'Error: This email address is already associated with another login method. Please use the login method you used previously.',
      variant: 'danger',
    }];
  }
  return {
    props: {
      csrfToken: await csrfToken(context),
      groupId,
      initAlerts,
    },
  };
};

export default SignIn;