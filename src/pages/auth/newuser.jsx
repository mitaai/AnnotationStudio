import { useState } from 'react';
import { useSession, getSession } from 'next-auth/client';
import fetch from 'unfetch';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Button, Card, Col, Container, Form, Row,
} from 'react-bootstrap';
import Feedback from 'react-bootstrap/Feedback';
import Link from 'next/link';
import fullName from '../../utils/nameUtil';
import Layout from '../../components/Layout';

const NewUser = () => {
  const [session] = useSession();

  const [errorMsg, setErrorMsg] = useState('');

  const submitHandler = async (values) => {
    const body = {
      email: session.user.email,
      firstName: values.firstName,
      lastName: values.lastName,
      name: fullName(values.firstName, values.lastName),
      affiliation: values.affiliation,
    };
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 201) {
      await res.json();
      getSession();
    } else {
      setErrorMsg(await res.text());
    }
  };

  const schema = yup.object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    tosCheck: yup.boolean()
      .required('You must agree to the Terms and Conditions before registering.')
      .oneOf([true], 'You must agree to the Terms and Conditions before registering.'),
  });

  return (
    <Layout>
      <Container>
        {session && (
          <Col lg="8" className="mx-auto">
            <Card>
              <Card.Body>
                <Card.Title>Welcome to Annotation Studio</Card.Title>
                <Card.Text>
                  Please fill out the following form to complete your registration.
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
                      {errorMsg ? <p style={{ color: 'red' }}>{errorMsg}</p> : null}
                      <Form.Group as={Row} controlId="formPlaintextEmail">
                        <Form.Label column lg="4">
                          Email
                        </Form.Label>
                        <Col>
                          <Form.Control name="email" plaintext readOnly defaultValue={session.user.email} />
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
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group>
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
                            disabled={props.isSubmitting}
                          >
                            Submit
                          </Button>
                        </Col>
                      </Row>
                      {/* <pre id="tester">
                        session.user:
                        {' '}
                        {JSON.stringify(session.user, null, 2)}
                      </pre> */}
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Container>
    </Layout>
  );
};

export default NewUser;
