import React, { useState } from 'react';
import fetch from 'unfetch';
import { Formik, Field } from 'formik';
import { useSession } from 'next-auth/client';
import {
  Button, Card, Col, Form, Row,
} from 'react-bootstrap';
import * as yup from 'yup';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import { Dropdown } from 'semantic-ui-react';
import QuillNoSSRWrapper from '../../components/QuillNoSSRWrapper';
import Layout from '../../components/Layout';
import SemanticField from '../../components/SemanticField';
import DocumentMetadata from '../../components/DocumentMetadata';
import LoadingSpinner from '../../components/LoadingSpinner';
import DocumentStatusSelect from '../../components/DocumentStatusSelect';

const NewDocument = () => {
  const [session] = useSession();
  const [errors, setErrors] = useState([]);

  const createDocument = async (values) => {
    const slug = `${slugify(values.title)}-${cryptoRandomString({ length: 5, type: 'hex' })}`;
    const postUrl = '/api/document';
    const res = await fetch(postUrl, {
      method: 'POST',
      body: JSON.stringify({
        ...values,
        slug,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      return Promise.resolve(result);
    }
    return Promise.reject(Error(`Unable to create document: error ${res.status} received from server`));
  };

  const schema = yup.object({
    title: yup.string().required('Required'),
    text: yup.string().required('Required'),
    resourceType: yup.string().required('Required'),
    rightsStatus: yup.string().required('Required'),
  });

  const resourceTypeList = [
    'Book',
    'Book Section',
    'Journal Article',
    'Magazine Article',
    'Newspaper Article',
    'Web Page',
    'Other',
  ];

  return (
    <Layout>
      <Col lg="12" className="mx-auto">
        <Card>
          {!session && (
            <LoadingSpinner />
          )}
          {session && (
            <>
              <Card.Header><Card.Title>Create a new document</Card.Title></Card.Header>
              <Card.Body>
                <Formik
                  onSubmit={(values, actions) => {
                    setTimeout(() => {
                      createDocument(values)
                        .then(setErrors([]))
                        .catch((err) => {
                          setErrors([err.message]);
                        });
                      actions.setSubmitting(false);
                    }, 1000);
                  }}
                  validationSchema={schema}
                  initialValues={{
                    text: '',
                    resourceType: 'Book',
                    rightsStatus: 'Copyrighted',
                    title: '',
                    groups: [''],
                    status: 'draft',
                  }}
                >
                  {(props) => (
                    <Form onSubmit={props.handleSubmit} noValidate className="pt-2">
                      <Form.Row>
                        <Col>
                          <Card className="mb-2">
                            <Card.Header>
                              <Card.Title>Paste or type directly into the form</Card.Title>
                            </Card.Header>
                            <Card.Body>
                              <Field name="text">
                                {({ field }) => (
                                  <QuillNoSSRWrapper
                                    theme="snow"
                                    value={field.value}
                                    onChange={field.onChange(field.name)}
                                  />
                                )}
                              </Field>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Card>
                            <Card.Header>
                              <Card.Title>Metadata</Card.Title>
                            </Card.Header>
                            <Card.Body>
                              <Form.Group controlId="documentResourceType">
                                <Form.Label>Type of resource</Form.Label>
                                <Form.Control
                                  as="select"
                                  name="resourceType"
                                  onChange={props.handleChange}
                                  onBlur={props.handleBlur}
                                  value={props.values.resourceType}
                                >
                                  {resourceTypeList.map(
                                    ((resourceType) => (
                                      <option key={resourceType}>{resourceType}</option>
                                    )),
                                  )}
                                </Form.Control>
                              </Form.Group>
                              <DocumentMetadata
                                values={props.values}
                                handleChange={props.handleChange}
                                handleBlur={props.handleBlur}
                                errors={props.errors}
                                touched={props.touched}
                                resourceType={props.values.resourceType}
                              />
                            </Card.Body>
                          </Card>
                        </Col>
                        <Col>
                          <Card className="mb-2">
                            <Card.Header>
                              <Card.Title>Share with Groups</Card.Title>
                            </Card.Header>
                            <Card.Body>
                              {session.user.groups && session.user.groups.length > 0 && (
                                <Row>
                                  <Col>
                                    Select the group(s) to which you wish to assign this document.
                                    <SemanticField
                                      name="groups"
                                      component={Dropdown}
                                      className="mt-2"
                                      placeholder="Groups"
                                      fluid
                                      multiple
                                      selection
                                      options={
                                        session.user.groups.map((group) => ({
                                          key: group.id,
                                          value: group.id,
                                          text: group.name,
                                        }))
                                      }
                                    />
                                  </Col>
                                </Row>
                              )}
                            </Card.Body>
                          </Card>
                          <Card>
                            <Card.Header>
                              <Card.Title>Status</Card.Title>
                            </Card.Header>
                            <Card.Body>
                              <DocumentStatusSelect
                                values={props.values}
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                              />
                              <Row>
                                <Col>
                                  <Button
                                    variant="primary"
                                    type="submit"
                                    disabled={props.isSubmitting}
                                    data-testid="newdoc-submit-button"
                                  >
                                    Create Document
                                  </Button>
                                </Col>
                              </Row>
                              <Row className="mt-3">
                                <Col>
                                  <pre>
                                    {errors !== [] && errors.map((error) => JSON.stringify(error))}
                                  </pre>
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Form.Row>
                    </Form>
                  )}
                </Formik>
              </Card.Body>
            </>
          )}
        </Card>
      </Col>
    </Layout>
  );
};

export default NewDocument;
