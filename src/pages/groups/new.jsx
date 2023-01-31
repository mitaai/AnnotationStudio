import fetch from 'unfetch';
import { Formik } from 'formik';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  Button, Card, Col, Form, Row,
} from 'react-bootstrap';
import * as yup from 'yup';
import Router from 'next/router';
import { addGroupToUser } from '../../utils/groupUtil';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';

const NewGroup = ({ statefulSession }) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [pageLoading, setPageLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (loading === false) {
      setPageLoading(false);
    }
  }, [loading]);

  const createGroup = async (values) => {
    const url = '/api/group';
    const { name } = values;
    const ownerName = session.user.name;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ name, ownerName }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      const group = {
        id: result.insertedId,
        name,
        ownerName: session.user.name || result.ops[0].members[0].name,
        memberCount: 1,
        role: 'owner',
      };
      const user = {
        id: result.ops[0].members[0].id,
      };
      return addGroupToUser(group, user).then(() => {
        Router.push({
          pathname: `/groups/${group.id}`,
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
    <Layout
      alerts={alerts}
      type="group"
      title="New Group"
      statefulSession={statefulSession}
      breadcrumbs={[
        { name: 'Groups', href: '/groups' },
        { name: 'Create a new group' },
      ]}
    >
      <Col lg="8" className="mx-auto">
        <Card>
          {((!session && loading) || (session && pageLoading)) && (
            <LoadingSpinner />
          )}
          {!session && !loading && (
            <UnauthorizedCard />
          )}
          {session && !loading && !pageLoading && (
            <Card.Body className="text-center">
              <Card.Title>Create a new group</Card.Title>

              <Formik
                onSubmit={(values, actions) => {
                  setPageLoading(true);
                  setTimeout(() => {
                    createGroup(values)
                      .catch((err) => {
                        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                        setPageLoading(false);
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
                            maxLength={255}
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
