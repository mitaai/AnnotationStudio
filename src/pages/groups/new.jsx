import fetch from 'unfetch';
import { Formik } from 'formik';
import { useSession } from 'next-auth/client';
import { useState } from 'react';
import {
  Button, Card, Col, Form, Row,
} from 'react-bootstrap';
import * as yup from 'yup';
import Router from 'next/router';
import { AddGroupToUser } from '../../utils/groupUtil';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const NewGroup = () => {
  const [session] = useSession();
  const [alerts, setAlerts] = useState([]);

  const createGroup = async (values) => {
    const url = '/api/group';
    const { name } = values;
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
        ownerName: result.ops[0].members[0].name,
        memberCount: 1,
        role: 'owner',
      };
      const user = {
        id: result.ops[0].members[0].id,
      };
      return AddGroupToUser(group, user).then(() => {
        Router.push({
          pathname: `/groups/${group.id}/edit`,
          query: { alert: 'newGroup' },
        });
      });
    }
    return Promise.reject(Error(`Unable to create group: error ${res.status} received from server`));
  };

  const schema = yup.object({
    name: yup.string().required('Required'),
  });

  return (
    <Layout alerts={alerts}>
      <Col lg="8" className="mx-auto">
        <Card>
          {!session && (
            <LoadingSpinner />
          )}
          {session && (
            <Card.Body className="text-center">
              <Card.Title>Create a new group</Card.Title>

              <Formik
                onSubmit={(values, actions) => {
                  setTimeout(() => {
                    createGroup(values).catch((err) => {
                      setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
                    });
                    actions.setSubmitting(false);
                  }, 1000);
                }}
                validationSchema={schema}
                initialValues={{
                  name: '',
                }}
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit} noValidate className="pt-2">
                    <Row>
                      <Col lg className="pr-1">
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

export default NewGroup;
