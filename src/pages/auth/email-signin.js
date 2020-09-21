import { setCookie } from 'nookies';
import React, { useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { csrfToken, useSession } from 'next-auth/client';
import { Button, Card, Form } from 'react-bootstrap';
import Router from 'next/router';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { AddUserToGroup } from '../../utils/groupUtil';

const SignIn = ({ props }) => {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState([]);

  const { csrfToken, groupId } = props; // eslint-disable-line no-shadow
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
              <Form.Label>Email address</Form.Label>
              <Form.Control name="email" type="email" placeholder="Email address" />
              <Button variant="outline-secondary" type="submit" className="mt-3">
                Submit
              </Button>
            </Form>
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
                AddUserToGroup({ id: groupId }, session.user.email).then(() => {
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
            You are already logged in.
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
  const { groupToken } = await context.query;
  let groupId = '';
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
  return {
    props: {
      csrfToken: await csrfToken(context),
      groupId,
    },
  };
};

export default SignIn;
