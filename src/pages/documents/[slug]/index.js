/* eslint-disable react/no-danger */

import { useState } from 'react';
import { useSession } from 'next-auth/client';
import $ from 'jquery';
import {
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
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
import { prefetchSharedAnnotationsOnDocument, getAnnotationById } from '../../../utils/annotationUtil';

export default function DocumentPage(props) {
  const { document, annotations, alerts } = props;

  const dummyData = [];

  /*
  const dummyData = [
    /*{
      _id: 'awef235235323',
      user: 'Joshua Mbogo',
      annotation: 'hello good sir how are you today?',
      date: '10/22/2020',
      tags: ['character-development', 'metaphor'],
      public: true,
      selector: {
        exact: 'dummy text of',
        prefix: 'hellois simply ',
        suffix: ' the printing and ty',
      },
    },
    {
      _id: '4tdvsdsfew',
      user: 'Kurt Fendt',
      annotation: 'highway the highway. shake away all the stress of my shoulder',
      date: '10/22/2020',
      tags: ['class study', 'Germany'],
      public: true,
      selector: {
        exact: 'Lorem Ipsum has',
        prefix: 'lois simply dummy text of the printing and typesetting industry. ',
        suffix: " been the industry's standard dummy text ever since the 1500s, wh",
      },
    },
    {
      _id: '4sdiosdv',
      user: 'Ben Silverman',
      annotation: 'i saved those feelings for you lets do all the stupid stuff young kids do',
      date: '10/22/2020',
      tags: ['paper', 'money', 'Utah'],
      public: true,
      selector: {
        exact: 'centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with',
        prefix: "hellois simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five ",
        suffix: " the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's stan",
      },
    },
    {
      _id: '43tfsdfds',
      user: 'Courtney Lee',
      annotation: 'ooohh oooh oooh oohh',
      date: '10/20/2020',
      tags: ['money', 'paper', 'atlanta'],
      public: true,
      selector: {
        exact: "like Aldus PageMaker including versions of Lorem Ipsum. is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem",
        prefix: 'publishing software ',
        suffix: ' Ipsum. is simply du',
      },
    },
    {
      _id: '34sifosdfiosfowe',
      user: 'Joshua Mbogo',
      annotation: 'baby baby baby',
      date: '12/25/2019',
      tags: ['christmass'],
      public: true,
      selector: {
        exact: 'dard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to m',
        prefix: "hellois simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's stan",
        suffix: 'ake a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetti',
      },
    },
    {
      _id: '4sdflkdsjcvsdffgio',
      user: 'Benny Bobby',
      annotation: "baby baby baby I have a lot to say but don't know how to say it. but i will say something because i need to say something. so this is it this is what I am about to say, ready here is what I am about to say here is what I am about to say ",
      date: '12/25/2019',
      tags: ['christmass', 'benny', 'super-hero-man-boy', 'metaphor', 'message'],
      public: true,
      selector: {
        exact: 'unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lor',
        prefix: "psum. is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an ",
        suffix: 'em Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. is simply dummy text of the p',
      },
    },
    {
      _id: '4sdjcvsdffgio',
      user: 'Joshua Mbogo',
      annotation: 'hello to my friends who are my good people I need more friends like my friends. but there are not friends like my friends. You understand that but you still go out to find more friends like my frineds.',
      date: '12/25/2019',
      tags: ['friends', 'bob', 'Daniel', 'rick', 'hanson', 'brandon', 'sam', 'joe'],
      public: true,
      selector: {
        exact: ' simply dummy text of the printing an',
        prefix: 'hellois',
        suffix: 'd typesetting indust',
      },
    },
    {
      _id: 'iojrfojsdfnvweio',
      user: 'Joshua Mbogo',
      annotation: 'All i can do is sing from the rooftops and sing in the trees',
      date: '12/25/2019',
      tags: ['tree-hugger'],
      public: true,
      selector: {
        exact: 'ercontinental wireless communication and power transmitter, but ran out of funding before he could complete it.',
        prefix: 'ower project, an int',
        suffix: '',
      },
    },
  ];
  */

  const [channelAnnotations, setChannelAnnotations] = useState({ left: null, right: null });
  const [annotationChannel1Loaded, setAnnotationChannel1Loaded] = useState(false);
  const [annotationChannel2Loaded, setAnnotationChannel2Loaded] = useState(false);

  const [session, loading] = useSession();

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
                  annotateDocument={(mySelector, annotationID) => { HighlightTextToAnnotate(mySelector, annotationID); }}
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
  await prefetchSharedAnnotationsOnDocument(slug, context.req.headers.cookie).then((annotations) => {
    props.annotations = annotations;
  }).catch((err) => {
    console.log(err);
    props = {
      alerts: [{ text: err.message, variant: 'danger' }],
    };
  });

  return { props };
}


async function HighlightText(obj, domElement) {
  const selector = createTextQuoteSelector(obj.selector);
  const matches = selector(domElement);
  for await (const range of matches) {
    // calls matches.next() -> Promise -> resolves -> returns -> {value: '', done: boolean}
    highlightRange(range, 'span', { ...obj.props });
  }
}

async function HighlightTextToAnnotate(mySelector, annotationID) {
  // this function takes a object selector and it highlights it accordingly so that the user knows what they are about to annotate
  const obj = {
    selector: mySelector,
    props: {
      class: 'text-currently-being-annotated active',
      'annotation-id': annotationID,
    },
  };

  // before we highlight the tex to annotate we need to make sure to unhighlight text that was trying to be annotated by the user previously
  $('.text-currently-being-annotated').removeClass('text-currently-being-annotated active');

  $('#document-content-container').addClass('unselectable');

  HighlightText(obj, $('#document-content-container').get(0));
}
