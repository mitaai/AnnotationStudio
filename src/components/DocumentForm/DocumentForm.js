/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import fetch from 'unfetch';
import { Formik, Field } from 'formik';
import {
  Button, Container, Card, Col, Form, Row,
} from 'react-bootstrap';
import {
  CameraVideoFill,
  CaretDownFill,
  CodeSquare,
  Image,
  Link45deg,
  ListOl,
  ListUl,
  Table,
  Type,
  TypeBold,
  TypeItalic,
  TypeStrikethrough,
  TypeUnderline,
} from 'react-bootstrap-icons';
import * as yup from 'yup';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import { Dropdown } from 'semantic-ui-react';
import { createEditor } from 'slate';
import {
  Slate, withReact,
} from 'slate-react';
import {
  AlignPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  EditablePlugins,
  HeadingPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  // MARK_BOLD,
  // MARK_CODE,
  // MARK_ITALIC,
  // MARK_STRIKETHROUGH,
  // MARK_SUBSCRIPT,
  // MARK_SUPERSCRIPT,
  // MARK_UNDERLINE,
  MediaEmbedPlugin,
  ParagraphPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  TodoListPlugin,
  UnderlinePlugin,
  pipe,
  withDeserializeHTML,
  withImageUpload,
  withLink,
  withList,
  withMarks,
  withTable,
  DEFAULTS_ALIGN,
  DEFAULTS_BOLD,
  DEFAULTS_BLOCKQUOTE,
  DEFAULTS_CODE,
  DEFAULTS_CODE_BLOCK,
  DEFAULTS_HEADING,
  DEFAULTS_ITALIC,
  DEFAULTS_LINK,
  DEFAULTS_LIST,
  DEFAULTS_IMAGE,
  DEFAULTS_MEDIA_EMBED,
  DEFAULTS_PARAGRAPH,
  DEFAULTS_STRIKETHROUGH,
  DEFAULTS_SUBSUPSCRIPT,
  DEFAULTS_TABLE,
  DEFAULTS_TODO_LIST,
  DEFAULTS_UNDERLINE,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import SemanticField from '../SemanticField';
import DocumentMetadata from '../DocumentMetadata';
import DocumentStatusSelect from '../DocumentStatusSelect';
import { deleteDocumentById } from '../../utils/docUtil';
import ConfirmationDialog from '../ConfirmationDialog';
import { updateAllAnnotationsOnDocument } from '../../utils/annotationUtil';
import {
  BlockButton,
  Element,
  Leaf,
  MarkButton,
  deserialize,
  serialize,
} from '../../utils/slateUtil';

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
  const [slateValue, setSlateValue] = useState([
    {
      children: [{ text: '' }],
    },
  ]);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  const plugins = [
    AlignPlugin(DEFAULTS_ALIGN),
    BoldPlugin(DEFAULTS_BOLD),
    BlockquotePlugin(DEFAULTS_BLOCKQUOTE),
    CodePlugin(DEFAULTS_CODE),
    CodeBlockPlugin(DEFAULTS_CODE_BLOCK),
    HeadingPlugin(DEFAULTS_HEADING),
    ImagePlugin(DEFAULTS_IMAGE),
    ItalicPlugin(DEFAULTS_ITALIC),
    LinkPlugin(DEFAULTS_LINK),
    ListPlugin(DEFAULTS_LIST),
    MediaEmbedPlugin(DEFAULTS_MEDIA_EMBED),
    ParagraphPlugin(DEFAULTS_PARAGRAPH),
    StrikethroughPlugin(DEFAULTS_STRIKETHROUGH),
    SubscriptPlugin(DEFAULTS_SUBSUPSCRIPT),
    SuperscriptPlugin(DEFAULTS_SUBSUPSCRIPT),
    TablePlugin(DEFAULTS_TABLE),
    TodoListPlugin(DEFAULTS_TODO_LIST),
    UnderlinePlugin(DEFAULTS_UNDERLINE),
  ];

  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withLink(),
    withList(DEFAULTS_LIST),
    withMarks(),
    withTable(DEFAULTS_TABLE),
    withDeserializeHTML({ plugins }),
  ];
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const createDocument = async (values) => {
    const slug = `${slugify(values.title)}-${cryptoRandomString({ length: 5, type: 'hex' })}`;
    const postUrl = '/api/document';
    const valuesWithSerializedText = { ...values, text: { children: values.text } };
    const res = await fetch(postUrl, {
      method: 'POST',
      body: JSON.stringify({
        ...valuesWithSerializedText,
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
    const { id, slug } = data;
    const patchUrl = `/api/document/${id}`;
    const valuesWithSerializedText = { ...values, text: serialize({ children: values.text }) };
    const res = await fetch(patchUrl, {
      method: 'PATCH',
      body: JSON.stringify(valuesWithSerializedText),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      await res.json();
      const documentToUpdate = { ...valuesWithSerializedText, slug };
      return Promise.resolve(await updateAllAnnotationsOnDocument(documentToUpdate));
    }
    return Promise.reject(Error(`Unable to edit document: error ${res.status} received from server`));
  };

  const getInitialValues = (mode === 'edit' && data)
    ? {
      ...data,
      // eslint-disable-next-line no-undef
      text: deserialize(new DOMParser().parseFromString(data.text, 'text/html')),
    }
    : {
      text: { children: [{ text: '' }] },
      resourceType: 'Book',
      rightsStatus: 'Copyrighted',
      title: '',
      groups: [''],
      state: 'draft',
    };

  const schema = yup.object({
    title: yup.string().required('Required'),
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
          {(props.values.state === 'draft' || (data && data.state === 'draft')) && (
            <Form.Row>
              <Col>
                <Card className="mb-2">
                  <Card.Header>
                    <Card.Title>Paste or type directly into the form</Card.Title>
                  </Card.Header>
                  <Card.Body>
                    <Field name="text">
                      {({ field }) => (
                        <Slate
                          editor={editor}
                          value={slateValue}
                          onChange={(value) => {
                            setSlateValue(value);
                            props.setFieldValue(field.name, value);
                          }}
                        >
                          <div
                            className="slate-toolbar"
                          >
                            <Button disabled size="sm" variant="outline-secondary" className="group-end">
                              <Type />
                              <CaretDownFill className="type-caret" />
                            </Button>
                            <MarkButton format="bold">
                              <TypeBold />
                            </MarkButton>
                            <MarkButton format="italic">
                              <TypeItalic />
                            </MarkButton>
                            <MarkButton format="underline">
                              <TypeUnderline />
                            </MarkButton>
                            <MarkButton format="strikethrough" className="group-end">
                              <TypeStrikethrough />
                            </MarkButton>
                            <BlockButton format="bulleted-list">
                              <ListUl />
                            </BlockButton>
                            <BlockButton format="numbered-list" className="group-end">
                              <ListOl />
                            </BlockButton>
                            <Button disabled size="sm" variant="outline-secondary" className="group-end">
                              <Table />
                              <CaretDownFill className="type-caret" />
                            </Button>
                            <Button disabled size="sm" variant="outline-secondary">
                              <Link45deg />
                            </Button>
                            <Button disabled size="sm" variant="outline-secondary">
                              <Image />
                            </Button>
                            <Button disabled size="sm" variant="outline-secondary" className="group-end">
                              <CameraVideoFill className="group-end" />
                            </Button>
                            <Button disabled size="sm" variant="outline-secondary">
                              <CodeSquare />
                            </Button>
                          </div>
                          <EditablePlugins
                            plugins={plugins}
                            placeholder="Paste or type here"
                            id={field.name}
                            className="slate-editor"
                            style={{ minHeight: 300 }}
                            renderElement={[renderElement]}
                            renderLeaf={[renderLeaf]}
                          />
                        </Slate>
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
