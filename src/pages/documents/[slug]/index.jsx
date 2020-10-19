import { useState } from 'react';
import { useSession } from 'next-auth/client';
import $ from 'jquery';
import {
  Row,
  Col,
  Card,
  Modal,
  ProgressBar,
} from 'react-bootstrap';
import {
  createTextQuoteSelector,
  highlightRange,
} from 'apache-annotator/dom';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AnnotationChannel from '../../../components/AnnotationChannel';
import Document from '../../../components/Document';
import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import { prefetchSharedAnnotationsOnDocument } from '../../../utils/annotationUtil';

export default function DocumentPage(props) {
  const { document, annotations, alerts } = props;

  const [channelAnnotations, setChannelAnnotations] = useState({ left: null, right: null });
  const [annotationChannel1Loaded, setAnnotationChannel1Loaded] = useState(false);
  const [annotationChannel2Loaded, setAnnotationChannel2Loaded] = useState(false);

  const [session, loading] = useSession();

  const highlightText = async (obj, domElement) => {
    const selector = createTextQuoteSelector(obj.selector);
    const matches = selector(domElement);
    matches.map(async (range) => {
      await highlightRange(range, 'span', { ...obj.props });
    });
  };

  const highlightTextToAnnotate = async (mySelector, annotationID) => {
    // this function takes a object selector and it highlights it
    // accordingly so that the user knows what they are about to annotate
    const obj = {
      selector: mySelector,
      props: {
        class: 'text-currently-being-annotated active',
        'annotation-id': annotationID,
      },
    };

    // before we highlight the tex to annotate we need to
    // make sure to unhighlight text that was trying to be annotated by the user previously
    $('.text-currently-being-annotated').removeClass('text-currently-being-annotated active');

    $('#document-content-container').addClass('unselectable');

    highlightText(obj, $('#document-content-container').get(0));
  };

  return (
    <>
      {!session && loading && (
      <LoadingSpinner />
      )}
      {!session && !loading && (
      <>You must be logged in to view this page.</>
      )}
      {session && !loading && (
      <Layout
        type="document"
        title={document === undefined ? '' : document.title}
        alerts={alerts}
        docView
      >
        <Row id="document-container">
          <Col sm={3}>
            <AnnotationChannel
              setAnnotationChannelLoaded={setAnnotationChannel1Loaded}
              side="left"
              annotations={channelAnnotations.left}
              user={session ? session.user : undefined}
            />
          </Col>
          <Col sm={6}>
            <Card id="document-card-container">
              <Card.Body>
                <Document
                  setChannelAnnotations={setChannelAnnotations}
                  annotations={annotations}
                  annotateDocument={
                    (mySelector, annotationID) => {
                      highlightTextToAnnotate(mySelector, annotationID);
                    }
                  }
                  document={document}
                  user={session ? session.user : undefined}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col sm={3}>
            <AnnotationChannel
              setAnnotationChannelLoaded={setAnnotationChannel2Loaded}
              side="right"
              annotations={channelAnnotations.right}
              user={session ? session.user : undefined}
            />
          </Col>
        </Row>
        <Modal
          show={!(annotationChannel1Loaded && annotationChannel2Loaded)}
          backdrop="static"
          keyboard={false}
          animation={false}
        >
          <Modal.Header>
            <Modal.Title>
              Loading Annotations
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ProgressBar animated now={100} />
          </Modal.Body>
        </Modal>
      </Layout>
      )}

      <style jsx global>
        {`
          #annotations-header-label {
            padding: 12px 0px 0px 20px;
          }

          #document-container {
            height: calc(100vh - 230px);
            overflow-y: scroll;
            padding: 10px 0px;
          }
          
          #document-container #annotation-well-card-container {
            min-height: 100%;
            background-color: transparent;
          }

          #document-container #document-card-container {
            padding: 40px;
            font-family: 'Times';
            border-radius: 0px;
            min-height: 100%;
            border: none;
            box-shadow: 3px 3px 9px 0px rgba(0,0,0,0.38);
          }

          #document-container #annotation-well-card-container .card-body {
            padding: 10px;
          }
              
          #document-container #annotation-well-card-container .card-body #annotation-well-header {
              margin-bottom: 10px;
          }

          #document-container #annotation-well-card-container .card-body #annotation-list-container > .col > .row {
            margin-bottom: 5px;
          }  
  
          #document-container #annotation-well-card-container .card-body #annotation-list-container > .col > .row .card {
            border: none;
            box-shadow: 0px 0px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
          }
  
          #document-container #annotation-well-card-container .card-body .btn-group:first-child {
              margin-right: 10px;
          }
  
          #document-container #annotation-well-card-container .card-body .list-group-item {
              padding: 5px 10px;
          }

          .text-currently-being-annotated.active {
            background-color: rgba(0, 123, 255, 0.5);
          }
          
        `}
      </style>
    </>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  let props = {};
  await prefetchDocumentBySlug(slug, context.req.headers.cookie).then((response) => {
    props.document = {
      slug,
      ...response,
    };
  }).catch((err) => {
    props = {
      alerts: [{ text: err.message, variant: 'danger' }],
    };
  });

  // after we get the document data we need to get the annotations on this document data
  await prefetchSharedAnnotationsOnDocument(slug, context.req.headers.cookie)
    .then((annotations) => {
      props.annotations = annotations;
    }).catch((err) => {
      props = {
        alerts: [{ text: err.message, variant: 'danger' }],
      };
    });

  return { props };
}

