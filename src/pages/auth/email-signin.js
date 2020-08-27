import React from 'react';
import { csrfToken } from 'next-auth/client';
import { Button, Card, Form } from 'react-bootstrap';
import Layout from '../../components/Layout';

// eslint-disable-next-line no-shadow
const SignIn = ({ csrfToken, groupToken }) => (
  <Layout
    type="signin"
  >
    <Card style={{ width: '33%', 'margin-left': '33%' }} className="text-center">
      <Card.Header>Log In / Sign Up</Card.Header>
      <Card.Body>
        <Form method="post" action="/api/auth/signin/email">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <input name="groupToken" type="hidden" defaultValue={groupToken} />
          <Form.Label>Email address</Form.Label>
          <Form.Control name="email" type="email" placeholder="Email address" />
          <Button variant="outline-secondary" type="submit" className="mt-3">
            Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  </Layout>
);

SignIn.getInitialProps = async (context) => ({
  csrfToken: await csrfToken(context),
  groupToken: await context.query.groupToken,
});

export default SignIn;
