import { useState } from 'react';
import { useSession } from 'next-auth/client';
import { Formik } from 'formik';
import * as yup from 'yup';
import {
  Button, Card, Col, Form, Row,
} from 'react-bootstrap';
import { FullName } from '../../../utils/nameUtil';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { updateAllAnnotationsByUser } from '../../../utils/annotationUtil';

const EditProfile = ({ user }) => {
  const [session, loading] = useSession();

  const [alerts, setAlerts] = useState([]);

  const submitHandler = async (values) => {
    const newName = FullName(values.firstName, values.lastName);
    const body = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      name: newName,
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
      const result = await res.json();
      const { groups, _id } = result.value;
      if (groups && groups.length > 0) {
        return Promise.all(groups.map(async (group) => {
          const url = `/api/group/${group.id}`;
          const groupBody = { memberToChangeNameId: _id, memberName: newName };
          // eslint-disable-next-line no-undef
          const groupRes = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(groupBody),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (groupRes.status === 200) {
            const groupResult = await groupRes.json();
            if (group.role === 'owner' && groupResult.value.members) {
              try {
                return Promise.all(groupResult.value.members.map(async (member) => {
                  const memberUrl = `/api/user/${member.id}`;
                  const memberBody = { updatedGroupId: group.id, ownerName: newName };
                  // eslint-disable-next-line no-undef
                  const memberRes = await fetch(memberUrl, {
                    method: 'PATCH',
                    body: JSON.stringify(memberBody),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  });
                  if (memberRes.status === 200) return Promise.resolve(memberRes.json());
                  return Promise.reject(Error(`Error: received code ${memberRes.status} from server`));
                }));
              } catch (err) {
                return Promise.reject(err.message);
              }
            } return Promise.resolve(groupResult);
          } return Promise.reject(Error(`Error: received code ${groupRes.status} from server`));
        })).catch((err) => {
          setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
        }).then(async () => {
          const userToUpdate = {
            id: _id,
            name: body.name,
            email: body.email,
          };
          return Promise.resolve(await updateAllAnnotationsByUser(userToUpdate));
        });
      }
      return Promise.resolve(result);
    }
    return Promise.reject(Error(await res.text()));
  };

  const schema = yup.object({
    firstName: yup.string().required('Required'),
    lastName: yup.string().required('Required'),
    affiliation: yup.string().required('Required'),
  });

  return (
    <Layout alerts={alerts} type="profile">
      <Col lg="8" className="mx-auto">
        <Card>
          {!session && loading && (
            <LoadingSpinner />
          )}
          {session && user && (
            <Card.Body>
              <Card.Title>Edit Profile</Card.Title>
              <Formik
                onSubmit={(values, actions) => {
                  setTimeout(() => {
                    submitHandler(values)
                      .then(() => {
                        setAlerts([...alerts, { text: 'Profile updated successfully.', variant: 'success' }]);
                      })
                      .catch((err) => {
                        setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
                      });
                    actions.setSubmitting(false);
                  }, 1000);
                }}
                validationSchema={schema}
                initialValues={user}
                enableReinitialize
              >
                {(props) => (
                  <Form onSubmit={props.handleSubmit} noValidate>
                    <Form.Group as={Row} controlId="formPlaintextEmail">
                      <Form.Label column lg="4">
                        Email
                      </Form.Label>
                      <Col>
                        <Form.Control
                          name="email"
                          plaintext
                          readOnly
                          value={user ? user.email : session.user.email}
                        />
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
                          maxLength={255}
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
                          maxLength={255}
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
                          maxLength={255}
                        />
                      </Col>
                    </Form.Group>
                    <Row>
                      <Col className="text-right">
                        <Button
                          variant="primary"
                          type="submit"
                          disabled={props.isSubmitting}
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
    headers: {
      'Content-Type': 'application/json',
      Cookie: context.req.headers.cookie,
    },
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
