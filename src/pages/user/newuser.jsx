/* eslint-disable camelcase */
import { parseCookies, destroyCookie } from 'nookies';
import { useState, useEffect } from 'react';
import { useSession, getSession } from 'next-auth/client';
import unfetch from 'unfetch';
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
import UnauthorizedCard from '../../components/UnauthorizedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { addUserToGroup } from '../../utils/groupUtil';
import { appendProtocolIfMissing } from '../../utils/fetchUtil';

const NewUser = ({ groupId, updateSession, statefulSession }) => {
  const [session, loading] = useSession();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading === false) {
      setPageLoading(false);
    }
  }, [loading]);

  const [alerts, setAlerts] = useState([]);

  const pushToHome = (regSession) => {
    Router.push({
      pathname: '/',
      query: {
        alert: 'completeRegistration',
        statefulSession: regSession,
      },
    }, '/').then(() => {
      destroyCookie(null, 'ans_grouptoken', {
        path: '/',
      });
    });
  };

  const submitHandler = async (values) => {
    setPageLoading(true);
    const newName = FullName(values.firstName, values.lastName);
    const body = {
      email: session.user.email,
      firstName: values.firstName,
      lastName: values.lastName,
      name: newName,
      affiliation: values.affiliation,
      slug: session.user.email.replace(/[*+~.()'"!:@]/g, '-'),
    };

    const regSession = {
      user: {
        name: newName,
        firstName: values.firstName,
        email: session.user.email,
        image: session.user.image,
        id: session.user.id,
        groups: session.user.groups,
        role: session.user.role,
      },
      expires: session.expires,
    };

    updateSession(regSession);

    const res = await unfetch('/api/users', {
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
          pushToHome(regSession);
        }).catch((err) => {
          setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
          setPageLoading(false);
        });
      } else pushToHome(regSession);
    } else {
      setAlerts((prevState) => [...prevState, { text: res.text(), variant: 'danger' }]);
      setPageLoading(false);
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
    <Layout alerts={alerts} type="newuser" statefulSession={statefulSession}>
      <Col lg="8" className="mx-auto">
        <Card>
          {((loading && !session) || (pageLoading && session)) && (
            <LoadingSpinner />
          )}
          {!loading && !session && (
            <UnauthorizedCard />
          )}
          {!pageLoading && (statefulSession || (session && session.user.firstName)) && (
            <Card.Body className="text-center">
              <Card.Title>Welcome to Annotation Studio</Card.Title>
              <Card.Text>
                Your registration is complete.
                <br />
                <Button
                  className="mt-3"
                  href="/"
                >
                  Go to Dashboard
                </Button>
              </Card.Text>
            </Card.Body>
          )}
          {!pageLoading && session
          && session.user && !session.user.firstName && !statefulSession && (
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
                          maxLength={255}
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
                          maxLength={255}
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
                          maxLength={255}
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
    const url = `${appendProtocolIfMissing(process.env.SITE)}/api/invite/${ans_grouptoken}`;
    // eslint-disable-next-line no-undef
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
