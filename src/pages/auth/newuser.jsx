import { useSession } from 'next-auth/client';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Button, Card, Col, Container, Form, Row,
} from 'react-bootstrap';
import Feedback from 'react-bootstrap/Feedback';
import Link from 'next/link';
import Layout from '../../components/Layout';

export default function NewUser() {
  const [session] = useSession();

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
                  validationSchema={schema}
                  initialValues={{
                    firstName: '',
                    lastName: '',
                    affiliation: '',
                    tosCheck: false,
                  }}
                >
                  {({
                    handleSubmit,
                    handleChange,
                    handleBlur,
                    values,
                    touched,
                    errors,
                  }) => (
                    <Form onSubmit={handleSubmit} noValidate>
                      <Form.Group as={Row} controlId="formPlaintextEmail">
                        <Form.Label column lg="4">
                          Email
                        </Form.Label>
                        <Col>
                          <Form.Control plaintext readOnly defaultValue={session.user.email} />
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
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.firstName}
                            isValid={touched.firstName && !errors.firstName}
                            isInvalid={!!errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.firstName}
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
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.lastName}
                            isValid={touched.lastName && !errors.lastName}
                            isInvalid={!!errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.lastName}
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
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.affiliation}
                            isValid={touched.affiliation && !errors.affiliation}
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
                            value={values.tosCheck}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isValid={touched.tosCheck && !errors.tosCheck}
                            isInvalid={!!errors.tosCheck}
                          />
                          <Form.Check.Label for="tosCheck">
                            I agree to the Annotation Studio
                            {' '}
                            <Link href="#tos">Terms and Conditions</Link>
                          </Form.Check.Label>
                          <Feedback type="invalid">
                            {errors.tosCheck}
                          </Feedback>
                        </Form.Check>
                      </Form.Group>
                      <Row>
                        <Col className="text-right">
                          {!Formik.isSubmitting && (
                            <Button variant="primary" type="submit">
                              Submit
                            </Button>
                          )}
                          {Formik.isSubmitting && (
                            <Button variant="primary" type="submit" disabled>
                              Submit
                            </Button>
                          )}
                        </Col>
                      </Row>
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
}
