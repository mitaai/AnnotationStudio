import { useState } from 'react';
import { useSession, getSession } from 'next-auth/client';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Button, Card, Col, Form, Row, Spinner,
} from 'react-bootstrap';
import Router from 'next/router';
import fullName from '../../../utils/nameUtil';
import Layout from '../../../components/Layout';

const EditProfile = ({ user }) => {
  const [session] = useSession();

  const [errorMsg, setErrorMsg] = useState('');

  const submitHandler = async (values) => {
    const body = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      name: fullName(values.firstName, values.lastName),
      affiliation: values.affiliation,
      slug: values.email.replace(/[*+~.()'"!:@]/g, '-'),
    };
    // eslint-disable-next-line no-undef
    const res = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 200) {
      await res.json();
      getSession();
      Router.push({
        pathname: '/',
        query: {
          alert: 'profileEdited',
        },
      });
    } else {
      setErrorMsg(await res.text());
    }
  };

  const schema = yup.object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    affiliation: yup.string().required('Required'),
  });

  return (
    <Layout>
      <Col lg="8" className="mx-auto">
        <Card>
          {!session && (
            <Card.Body className="text-center">
              <Spinner animation="border" role="status">
                <span className="sr-only">Loading...</span>
              </Spinner>
            </Card.Body>
          )}
          {session && user && (
            <Card.Body>
              <Card.Title>Edit Profile</Card.Title>
              <Formik
                onSubmit={(values, actions) => {
                  setTimeout(() => {
                    submitHandler(values);
                    actions.setSubmitting(false);
                  }, 1000);
                }}
                validationSchema={schema}
                initialValues={user}
                enableReinitialize
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit} noValidate>
                    {errorMsg ? <p style={{ color: 'red' }}>{errorMsg}</p> : null}
                    <Form.Group as={Row} controlId="formPlaintextEmail">
                      <Form.Label column lg="4">
                        Email
                      </Form.Label>
                      <Col>
                        <Form.Control name="email" plaintext readOnly value={session.user.email} />
                      </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="validationFormik01">
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

                    <Form.Group as={Row} controlId="validationFormik02">
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

                    <Form.Group as={Row} controlId="validationFormik03">
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
                    <Row>
                      <Col className="text-right">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={props.isSubmitting || props.submitCount >= 1}
                          data-testid="editprofile-submit-button"
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

export async function getServerSideProps(context) {
  const { slug } = context.params;

  const url = `${process.env.SITE}/api/user/slug/${slug}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 200) {
    const foundUser = await res.json();
    const {
      email, firstName, lastName, affiliation,
    } = foundUser;
    const user = {
      email, firstName, lastName, affiliation,
    };
    return {
      props: { user },
    };
  }
  return {
    props: { },
  };
}

export default EditProfile;