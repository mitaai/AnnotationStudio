import React, { useState } from 'react';
import { useRouter } from 'next/router';
import fetch from 'unfetch';
import { Formik, Field } from 'formik';
import {
  Button, Container, Card, Col, Form, Row,
} from 'react-bootstrap';
import * as yup from 'yup';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import { Dropdown } from 'semantic-ui-react';
import QuillNoSSRWrapper from '../QuillNoSSRWrapper';
import SemanticField from '../SemanticField';
import DocumentMetadata from '../DocumentMetadata';
import DocumentStatusSelect from '../DocumentStatusSelect';
import { deleteDocumentById } from '../../utils/docUtil';
import ConfirmationDialog from '../ConfirmationDialog';

const DocumentForm = ({
  session,
  mode,
  data,
}) => {
  const [errors, setErrors] = useState([]);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

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

  const editDocument = async (values) => {
    const { id } = data;
    const patchUrl = `/api/document/${id}`;
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      body: JSON.stringify(values),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      return Promise.resolve(result);
    }
    return Promise.reject(Error(`Unable to edit document: error ${res.status} received from server`));
  };

  const getInitialValues = (mode === 'edit' && data) ? data : {
    text: '',
    resourceType: 'Book',
    rightsStatus: 'Copyrighted',
    title: '',
    groups: [''],
    state: 'draft',
  };
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
  ];

  const schema = yup.object({
    title: yup.string().required('Required'),
    text: yup.string().required('Required'),
    resourceType: yup.string().required('Required'),
    rightsStatus: yup.string().required('Required'),
    state: yup.string().required('Required'),
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
    <Formik
      onSubmit={(values, actions) => {
        const submitFunction = mode === 'edit' ? editDocument : createDocument;
        setTimeout(() => {
          submitFunction(values)
            .then(() => {
              setErrors([]);
              router.push({
                pathname: '/documents',
                query: {
                  tab: 'mine',
                  alert: (mode === 'edit') ? 'editedDocument' : 'createdDocument',
                },
              });
            })
            .catch((err) => {
              setErrors([err.message]);
            });
          actions.setSubmitting(false);
        }, 1000);
      }}
      validationSchema={schema}
      initialValues={getInitialValues}
      enableReinitialize
    >
      {(props) => (
        <Form onSubmit={props.handleSubmit} noValidate className="pt-2">
          {(props.values.state === 'draft' || data.state === 'draft') && (
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
                          modules={quillModules}
                          formats={quillFormats}
                          value={field.value}
                          onChange={field.onChange(field.name)}
                        />
                      )}
                    </Field>
                  </Card.Body>
                </Card>
              </Col>
            </Form.Row>
          )}
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
                  {(!session.user.groups || session.user.groups.length === 0) && (
                    <Row><Col>You are not a member of any groups.</Col></Row>
                  )}
                </Card.Body>
              </Card>
              <Card>
                <Card.Header>
                  <Card.Title>Status</Card.Title>
                </Card.Header>
                <Card.Body>
                  <DocumentStatusSelect
                    session={session}
                    values={props.values}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    disableDraft={data && data.state !== 'draft'}
                  />
                  {errors && errors.length > 0 && (
                    <Row className="mt-3">
                      <Col>
                        <pre>
                          {errors.map((error) => JSON.stringify(error))}
                        </pre>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>
              <Row className="mt-3">
                <Col>
                  <Container style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      variant="outline-secondary"
                    >
                      Cancel
                    </Button>
                    {mode === 'edit' && (
                      <>
                        <Button
                          variant="outline-danger"
                          type="button"
                          onClick={handleShowModal}
                          data-testid="documentedit-delete-button"
                        >
                          Delete Document
                        </Button>
                        <ConfirmationDialog
                          name={data.title}
                          type="document"
                          handleCloseModal={handleCloseModal}
                          show={showModal}
                          onClick={(event) => {
                            event.target.setAttribute('disabled', 'true');
                            deleteDocumentById(data.id).then(() => {
                              router.push({
                                pathname: '/documents',
                                query: {
                                  alert: 'deletedDocument',
                                  tab: 'mine',
                                },
                              });
                            }).catch((err) => {
                              setErrors([err.message]);
                            });
                            handleCloseModal();
                          }}
                        />
                      </>
                    )}
                    <Button
                      variant={mode === 'edit' ? 'success' : 'primary'}
                      type="submit"
                      disabled={props.isSubmitting}
                      data-testid="documentform-submit-button"
                    >
                      {mode === 'edit' ? (<>Save Changes</>) : (<>Create Document</>)}
                    </Button>
                  </Container>
                </Col>
              </Row>
            </Col>
          </Form.Row>
        </Form>
      )}
    </Formik>
  );
};

export default DocumentForm;
