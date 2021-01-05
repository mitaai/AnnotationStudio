import { setCookie } from 'nookies';
import Router from 'next/router';
import React, { useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { csrfToken, useSession } from 'next-auth/client';
import { Button, Card, Form } from 'react-bootstrap';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import GroupJoinCard from '../../components/GroupJoinCard';

const SignIn = ({
  props,
  updateSession,
}) => {
  const [session, loading] = useSession();

  const {
    cToken,
    groupId,
    initAlerts,
    groupToken,
  } = props; // eslint-disable-line no-shadow
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
              <input name="csrfToken" type="hidden" defaultValue={cToken} />
              <input name="callbackUrl" type="hidden" defaultValue={Router.query.callbackUrl} />
              <Form.Label>With email address</Form.Label>
              <Form.Control name="email" type="email" placeholder="Email address" />
              <Button variant="outline-secondary" type="submit" className="mt-3">
                Submit
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
      {session && groupId && groupId !== '' && (
        <GroupJoinCard
          alerts={alerts}
          setAlerts={setAlerts}
          pageFrom="signin"
          groupId={groupId}
          token={groupToken}
          session={session}
          updateSession={updateSession}
        />
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
      cToken: await csrfToken(context),
      groupToken,
      groupId,
      initAlerts,
    },
  };
};

export default SignIn;
