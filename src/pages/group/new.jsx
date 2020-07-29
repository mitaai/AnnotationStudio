import fetch from 'unfetch';
import { Formik } from 'formik';
import { useSession } from 'next-auth/client';
import {
  Button, Card, Col, Form, Row, Spinner,
} from 'react-bootstrap';
import * as yup from 'yup';
import Layout from '../../components/Layout';

const NewGroup = () => {
  const [session] = useSession();

  const updateOwnerWithGroup = async ({ id, name, user }) => {
    const url = `/api/user/${user}`;
    const body = {
      addedGroup: {
        id,
        name,
        role: 'owner',
      },
    };
    const res = await fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      return Promise.resolve(result);
    }
    return Promise.reject(Error(`Unable to add group to user: error ${res.status} received from server`));
  };

  const submitHandler = async (name) => {
    const url = '/api/group';
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      const group = {
        id: result.insertedId,
        name,
        user: result.ops[0].members[0].id,
      };
      return updateOwnerWithGroup(group);
    }
    return Promise.reject(Error(`Unable to create group: error ${res.status} received from server`));
  };

  const schema = yup.object({
    name: yup.string().required('Required'),
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
          {session && (
            <Card.Body className="text-center">
              <Card.Title>Create a new group</Card.Title>

              <Formik
                onSubmit={(values, actions) => {
                  setTimeout(() => {
                    submitHandler(values);
                    actions.setSubmitting(false);
                  }, 1000);
                }}
                validationSchema={schema}
                initialValues={{
                  name: '',
                }}
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit} noValidate as={Row} className="pt-2">
                    <Col lg>
                      <Form.Group controlId="formPlaintextGroupName">
                        <Form.Control
                          size="lg"
                          type="text"
                          name="name"
                          placeholder="Name"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.name}
                          isValid={props.touched.name && !props.errors.name}
                          isInvalid={!!props.errors.name}
                        />
                        <Form.Control.Feedback type="invalid">
                          {props.errors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col lg="auto">
                      <Button
                        variant="primary"
                        size="lg"
                        type="submit"
                        disabled={props.isSubmitting || props.submitCount >= 1}
                        data-testid="newgroup-submit-button"
                      >
                        Create
                      </Button>
                    </Col>
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

export default NewGroup;
