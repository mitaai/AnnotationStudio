/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useState, useMemo, useContext, useEffect,
} from 'react';
import { useRouter } from 'next/router';
import unfetch from 'unfetch';
import { Formik, Field } from 'formik';
import {
  Accordion,
  AccordionContext,
  Button,
  Container,
  Card,
  Col,
  Form,
  ProgressBar,
  Row,
  Spinner,
  useAccordionToggle,
} from 'react-bootstrap';
import * as yup from 'yup';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import { createEditor } from 'slate';
import {
  Slate, withReact,
} from 'slate-react';
import {
  DEFAULTS_LIST,
  DEFAULTS_PARAGRAPH,
  DEFAULTS_TABLE,
  EditablePlugins,
  deserializeHTMLToDocument,
  pipe,
  serializeHTMLFromNodes,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withList,
  withMarks,
  withTable,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { Dropdown as SemanticUIDropdown } from 'semantic-ui-react';
import ReactS3Uploader from 'react-s3-uploader';
import SemanticField from '../SemanticField';
import DocumentMetadata from '../DocumentMetadata';
import DocumentStatusSelect from '../DocumentStatusSelect';
import { deleteDocumentById } from '../../utils/docUtil';
import ConfirmationDialog from '../ConfirmationDialog';
import { updateAllAnnotationsOnDocument } from '../../utils/annotationUtil';
import { plugins, withDivs } from '../../utils/slateUtil';
import SlateToolbar from '../SlateToolbar';

const DocumentForm = ({
  session,
  mode,
  data,
  setErrors,
}) => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [contentType, setContentType] = useState('');
  const [progress, setProgress] = useState({});
  const [htmlValue, setHtmlValue] = useState('');
  const [slateLoading, setSlateLoading] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);


  const ContextAwareToggle = ({
    children, disabled, eventKey, callback,
  }) => {
    const currentEventKey = useContext(AccordionContext);

    const decoratedOnClick = useAccordionToggle(
      eventKey,
      () => callback && callback(eventKey),
    );

    const isCurrentEventKey = currentEventKey === eventKey;

    return (
      <Button
        type="button"
        variant={isCurrentEventKey ? 'text' : 'link'}
        onClick={decoratedOnClick}
        disabled={disabled}
      >
        {children}
      </Button>
    );
  };
  const ProgressIndicator = ({ percent, status }) => {
    let color;
    let msg;
    switch (status) {
      case 'Complete': {
        color = 'success';
        msg = 'Complete';
        break;
      }
      case 'Failed': {
        color = 'danger';
        msg = 'Failed';
        break;
      }
      default: {
        color = 'warning';
        msg = 'Processing...';
      }
    }
    if (percent === 0) msg = '';
    return (
      <>
        <ProgressBar className="mt-3" animated={percent !== 100} now={100} variant={color} label={msg} />
        {msg === 'Processing...' && (
          <Container className="mt-3 text-muted">
            <Row>
              <Col>
                Please wait, this process may take up to 2 minutes,
                especially for longer or more complex documents.
                Please do not navigate away from this page.
              </Col>
            </Row>
          </Container>
        )}
        {status === 'Failed' && (
          <Container className="mt-3 text-danger">
            <Row>
              <Col>
                There was an error with your upload, please retry.
                <br />
                Still not working? Here are some possible reasons why your upload failed:
                <ul>
                  <li>The file was too large.</li>
                  <li>The file had too many pages.</li>
                  <li>The file was too complex (many diagrams, drawings, images, or symbols).</li>
                </ul>
                If none of these seem accurate, please send an email to
                {' '}
                <a href="mailto:aai-support@mit.edu">aai-support@mit.edu</a>
                {' '}
                with a link to your original file.
              </Col>
            </Row>
          </Container>
        )}
      </>
    );
  };

  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withInlineVoid({ plugins }),
    withList(DEFAULTS_LIST),
    withMarks(),
    withTable(DEFAULTS_TABLE),
    withDeserializeHTML({ plugins }),
    withDivs(),
  ];
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const numRetries = 60;
  const origPercent = 25;

  const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchRetry = async (url, options = {}, retries = numRetries, backoff = 2400) => {
    const retryCodes = [403, 408, 500, 502, 503, 504, 522, 524];
    return unfetch(url, options)
      .then(async (res) => {
        if (res.ok) {
          setProgress({
            started: true,
            percent: 100,
            status: 'Complete',
          });
          const text = await res.text();
          return text;
        } if (retries > 0 && retryCodes.includes(res.status)) {
          setProgress(
            {
              started: true,
              percent: origPercent + (
                ((numRetries - retries) / numRetries) * (100 - origPercent)
              ),
              status: 'Waiting',
            },
          );
          await timeout(backoff);
          return fetchRetry(url, options, retries - 1, backoff);
        }
        setProgress(
          {
            started: false,
            percent: 100,
            status: 'Failed',
          },
        );
        throw new Error('Failed');
      })
      .then((text) => text)
      .catch((err) => setErrors([{ text: err.message, variant: 'danger' }]));
  };

  const getProcessedDocument = async (url) => fetchRetry(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  });

  const createDocument = async (values) => {
    const slug = `${slugify(values.title)}-${cryptoRandomString({ length: 5, type: 'hex' })}`;
    const postUrl = '/api/document';
    const valuesWithSerializedText = htmlValue !== ''
      ? {
        ...values,
        uploadContentType: contentType,
        text: htmlValue,
      }
      : {
        ...values,
        text: serializeHTMLFromNodes({ plugins, nodes: values.textSlate }),
      };
    const res = await unfetch(postUrl, {
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
    } if (res.status === 413) {
      return Promise.reject(Error(
        'Sorry, this file is too large to use on Annotation Studio. '
        + 'You may try breaking it up into smaller parts.',
      ));
    }
    return Promise.reject(Error(`Unable to create document: error ${res.status} received from server`));
  };

  const editDocument = async (values) => {
    const { id, slug, uploadContentType } = data;
    const patchUrl = `/api/document/${id}`;
    const { text, ...rest } = values;
    const valuesWithSerializedText = (uploadContentType && (data.uploadContentType.includes('pdf') || data.uploadContentType.includes('epub')))
      ? rest
      : {
        ...values,
        text: serializeHTMLFromNodes({ plugins, nodes: values.textSlate }),
      };
    const res = await unfetch(patchUrl, {
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

  // eslint-disable-next-line no-undef
  const txtHtml = (mode === 'edit' && data) ? new DOMParser().parseFromString(data.text, 'text/html') : undefined;
  const slateInitialValue = [
    {
      children: [{ text: '' }],
      type: DEFAULTS_PARAGRAPH.p.type,
    },
  ];
  const [slateValue, setSlateValue] = (mode === 'edit' && data && (!data.uploadContentType
    || (!data.uploadContentType.includes('pdf') && !data.uploadContentType.includes('epub'))))
    ? useState(deserializeHTMLToDocument({ plugins, element: txtHtml.body }))
    : useState(slateInitialValue);

  let initialValues = {};

  if (mode === 'edit' && data) {
    if (!data.uploadContentType
      || (!data.uploadContentType.includes('pdf') && !data.uploadContentType.includes('epub'))) {
      initialValues = {
        ...data,
        textSlate: deserializeHTMLToDocument({ plugins, element: txtHtml.body }),
      };
    } else {
      initialValues = data;
    }
  } else {
    initialValues = {
      textSlate: slateInitialValue,
      resourceType: 'Book',
      rightsStatus: 'Copyrighted',
      contributors: [{ type: 'Author', name: '' }],
      title: '',
      groups: [],
      state: 'draft',
    };
  }

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

  useEffect(() => {
    setSlateLoading(false);
  }, [slateValue]);


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
              setErrors([{ text: err.message, variant: 'danger' }]);
            });
          actions.setSubmitting(false);
        }, 1000);
      }}
      validationSchema={schema}
      initialValues={initialValues}
      enableReinitialize
    >
      {(props) => (
        <Form onSubmit={props.handleSubmit} noValidate className="pt-2">
          {(!data
            || (data && data.state === 'draft' && (!data.uploadContentType
              || (!data.uploadContentType.includes('pdf') && !data.uploadContentType.includes('epub')))
            )
          ) && (
            <Form.Row>
              <Col>
                <Accordion defaultActiveKey="paste">
                  <Card>
                    <Card.Header>
                      <ContextAwareToggle eventKey="upload" disabled={data && data.state === 'draft'}>
                        Upload PDF, DOCX, ODT, or EPUB
                      </ContextAwareToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="upload">
                      <Card.Body id="document-upload-card">
                        <Field name="textUpload">
                          {() => (
                            <>
                              <ReactS3Uploader
                                signingUrl={process.env.NEXT_PUBLIC_SIGNING_URL}
                                signingUrlMethod="GET"
                                accept=".docx,.pdf,.odt,.epub"
                                s3path="files/"
                                disabled={props.isSubmitting || progress.started}
                                onProgress={
                                  (percent, status) => setProgress(
                                    {
                                      started: true,
                                      percent: percent / (100 / origPercent),
                                      status,
                                    },
                                  )
                                }
                                onError={((status) => setErrors([{ text: status, variant: 'danger' }]))}
                                onFinish={async (signRes, file) => {
                                  const fileUrl = signRes.signedUrl.substring(
                                    0, signRes.signedUrl.indexOf('?'),
                                  );
                                  const processedUrl = `${fileUrl.substring(
                                    0, fileUrl.indexOf('files'),
                                  )}processed/${signRes.filename.substring(
                                    0, signRes.filename.lastIndexOf('.'),
                                  )}.html`;
                                  const fileObj = {
                                    name: signRes.filename,
                                    size: file.size,
                                    contentType: file.type,
                                    url: fileUrl,
                                    processedUrl,
                                  };
                                  await getProcessedDocument(fileObj.processedUrl)
                                    .then((result) => {
                                      setHtmlValue(result);
                                      setContentType(fileObj.contentType);
                                    })
                                    .catch((err) => {
                                      setErrors([{ text: err.message, variant: 'danger' }]);
                                    });
                                }}
                                uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                              />
                              <Container>
                                <Row>
                                  <Col>
                                    <small className="text-muted ml-n3">
                                      Limit: 4 MB (file size may increase during processing)
                                    </small>
                                  </Col>
                                </Row>
                              </Container>
                              {(progress.started || progress.status === 'Failed') && (
                              <ProgressIndicator
                                percent={progress.percent}
                                status={progress.status}
                              />
                              )}
                            </>
                          )}
                        </Field>
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                  <Card className="mb-2">
                    <Card.Header>
                      <ContextAwareToggle eventKey="paste" disabled={progress.started || progress.status === 'Complete'}>
                        Paste or type directly into the form
                      </ContextAwareToggle>
                    </Card.Header>
                    <Accordion.Collapse eventKey="paste">
                      <Card.Body id="slate-container-card">
                        <div id="slate-container">
                          {!progress.started && progress.status !== 'Complete' && (
                            <Field name="textSlate">
                              {({ field }) => (
                                <Slate
                                  editor={editor}
                                  value={slateValue}
                                  disabled={props.isSubmitting}
                                  onChange={(value) => {
                                    setSlateLoading(false);
                                    setSlateValue(value);
                                    props.setFieldValue(field.name, value);
                                  }}
                                >
                                  <SlateToolbar
                                    disabled={props.isSubmitting}
                                  />
                                  {slateLoading && (
                                    <div id="slate-loader">
                                      <Spinner animation="border" role="status">
                                        <span className="sr-only">Loading...</span>
                                      </Spinner>
                                      <div className="text-center">
                                        <h4 className="text-muted">
                                          <em>Please wait, processing pasted content.</em>
                                        </h4>
                                        <small className="text-muted">
                                          The page may become unresponsive. Please do not
                                          close or navigate away from the page.
                                        </small>
                                      </div>
                                    </div>
                                  )}
                                  <EditablePlugins
                                    plugins={plugins}
                                    disabled={props.isSubmitting}
                                    onKeyDown={[(e) => {
                                      const isPasteCapture = (e.ctrlKey || e.metaKey)
                                        && e.keyCode === 86;
                                      if (isPasteCapture) {
                                        setSlateLoading(true);
                                      }
                                    }]}
                                    placeholder="Paste or type here"
                                    id={field.name}
                                    className="slate-editor"
                                    style={{ minHeight: 300 }}
                                  />
                                </Slate>
                              )}
                            </Field>
                          )}
                        </div>
                      </Card.Body>
                    </Accordion.Collapse>
                  </Card>
                </Accordion>
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
                      disabled={props.isSubmitting}
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
                    disabled={props.isSubmitting}
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
                          component={SemanticUIDropdown}
                          className="mt-2 mb-1"
                          placeholder="Groups"
                          fluid
                          multiple
                          selection
                          disabled={props.isSubmitting}
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
                    disabled={props.isSubmitting}
                    disableDraft={data && data.state !== 'draft'}
                  />
                  <small className="text-muted">
                    * Only documents created using &ldquo;Paste or
                    type directly into the form&rdquo;
                    can be edited, even in Draft mode.
                  </small>
                </Card.Body>
              </Card>
              <Row className="mt-3">
                <Col>
                  <Container style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      type="button"
                      onClick={() => router.back()}
                      variant="outline-secondary"
                      disabled={props.isSubmitting}
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
                          disabled={props.isSubmitting}
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
                              setErrors([{ text: err.message, variant: 'danger' }]);
                            });
                            handleCloseModal();
                          }}
                        />
                      </>
                    )}
                    <Button
                      variant={mode === 'edit' ? 'success' : 'primary'}
                      type="submit"
                      disabled={props.isSubmitting || (progress.started && progress.status !== 'Complete')}
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
