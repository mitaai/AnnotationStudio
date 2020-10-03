/* eslint-disable camelcase */
import { parseCookies, destroyCookie } from 'nookies';
import { useState } from 'react';
import { useSession, getSession } from 'next-auth/client';
import fetch from 'isomorphic-unfetch';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Button, Card, Col, Form, Row,
} from 'react-bootstrap';
import Feedback from 'react-bootstrap/Feedback';
import Link from 'next/link';
import Router from 'next/router';
import { FullName } from '../../utils/nameUtil';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { addUserToGroup } from '../../utils/groupUtil';

const NewUser = ({ groupId }) => {
  const [session] = useSession();

  const [alerts, setAlerts] = useState([]);

  const pushToHome = () => {
    Router.push({
      pathname: '/',
      query: { alert: 'completeRegistration' },
    }).then(() => {
      destroyCookie(null, 'ans_grouptoken', {
        path: '/',
      });
    });
  };

  const submitHandler = async (values) => {
    const body = {
      email: session.user.email,
      firstName: values.firstName,
      lastName: values.lastName,
      name: FullName(values.firstName, values.lastName),
      affiliation: values.affiliation,
      slug: session.user.email.replace(/[*+~.()'"!:@]/g, '-'),
    };
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (res.status === 200) {
      await res.json();
      getSession();
      if (groupId !== '') {
        destroyCookie(null, 'ans_grouptoken', {
          path: '/',
        });
        addUserToGroup({ id: groupId }, session.user.email).then(() => {
          pushToHome();
        }).catch((err) => {
          setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
        });
      } else pushToHome();
    } else {
      setAlerts([...alerts, { text: res.text(), variant: 'danger' }]);
    }
  };

  const schema = yup.object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    affiliation: yup.string().required('Required'),
    tosCheck: yup.boolean()
      .required('You must agree to the Terms and Conditions before registering.')
      .oneOf([true], 'You must agree to the Terms and Conditions before registering.'),
  });

  return (
    <Layout alerts={alerts}>
      <Col lg="8" className="mx-auto">
        <Card>
          {!session && (
            <LoadingSpinner />
          )}
          {session && (
            <Card.Body>
              <Card.Title>Welcome to Annotation Studio</Card.Title>
              <Card.Text>
                Please fill out the following form to complete your registration.
                {groupId && groupId !== '' && (
                  <>
                    {' '}
                    On submit, you will be automatically added to the group that invited you.
                  </>
                )}
              </Card.Text>

              <Formik
                onSubmit={(values, actions) => {
                  setTimeout(() => {
                    submitHandler(values);
                    actions.setSubmitting(false);
                  }, 1000);
                }}
                validationSchema={schema}
                initialValues={{
                  firstName: '',
                  lastName: '',
                  affiliation: '',
                  tosCheck: false,
                }}
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit} noValidate>
                    <Form.Group as={Row} controlId="formPlaintextEmail">
                      <Form.Label column lg="4">
                        Email
                      </Form.Label>
                      <Col>
                        <Form.Control name="email" plaintext readOnly defaultValue={session.user.email} />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextFirstName">
                      <Form.Label column lg="4">
                        First Name
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="firstName"
                          placeholder="First Name"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.firstName}
                          isValid={props.touched.firstName && !props.errors.firstName}
                          isInvalid={!!props.errors.firstName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {props.errors.firstName}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextLastName">
                      <Form.Label column lg="4">
                        Last Name
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.lastName}
                          isValid={props.touched.lastName && !props.errors.lastName}
                          isInvalid={!!props.errors.lastName}
                        />
                        <Form.Control.Feedback type="invalid">
                          {props.errors.lastName}
                        </Form.Control.Feedback>
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPlaintextAffiliation">
                      <Form.Label column lg="4">
                        Affiliation
                      </Form.Label>
                      <Col>
                        <Form.Control
                          type="text"
                          name="affiliation"
                          placeholder="e.g. MIT"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.affiliation}
                          isValid={props.touched.affiliation && !props.errors.affiliation}
                          isInvalid={!!props.errors.affiliation}
                        />
                      </Col>
                    </Form.Group>
                    <Form.Group controlId="formCheckboxTos">
                      <Form.Check type="checkbox">
                        <Form.Check.Input
                          required
                          type="checkbox"
                          name="tosCheck"
                          id="tosCheck"
                          value={props.values.tosCheck}
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          isValid={props.touched.tosCheck && !props.errors.tosCheck}
                          isInvalid={!!props.errors.tosCheck}
                        />
                        <Form.Check.Label htmlFor="tosCheck">
                          I agree to the Annotation Studio
                          {' '}
                          <Link href="#tos"><a href="#tos" title="tos">Terms and Conditions</a></Link>
                        </Form.Check.Label>
                        <Feedback type="invalid">
                          {props.errors.tosCheck}
                        </Feedback>
                      </Form.Check>
                    </Form.Group>
                    <Row>
                      <Col className="text-right">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={props.isSubmitting || props.submitCount >= 1}
                          data-testid="newuser-submit-button"
                        >
                          Submit
                        </Button>
                      </Col>
                    </Row>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          )}
        </Card>
      </Col>
    </Layout>
  );
};

NewUser.getInitialProps = async (context) => {
  const cookies = parseCookies(context);
  const { ans_grouptoken } = cookies;
  let groupId = '';
  if (ans_grouptoken) {
    const url = `${process.env.SITE}/api/invite/${ans_grouptoken}`;
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
  return { groupId };
};

export default NewUser;
