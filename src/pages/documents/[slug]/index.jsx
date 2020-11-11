/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
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
import DocumentAnnotationsContext from '../../../contexts/DocumentAnnotationsContext';
import DocumentFiltersContext from '../../../contexts/DocumentFiltersContext';


const adjustLine = (from, to, line) => {
  const fT = from.offsetTop + from.offsetHeight / 2;
  const tT = to.offsetTop 	 + to.offsetHeight / 2;
  const fL = from.offsetLeft + from.offsetWidth / 2;
  const tL = to.offsetLeft 	 + to.offsetWidth / 2;

  const CA = Math.abs(tT - fT);
  const CO = Math.abs(tL - fL);
  const H = Math.sqrt(CA * CA + CO * CO);
  let ANG = (180 / Math.PI) * Math.acos(CA / H);
  let top;
  let left;

  if (tT > fT) {
    top = (tT - fT) / 2 + fT;
  } else {
    top = (fT - tT) / 2 + tT;
  }
  if (tL > fL) {
    left = (tL - fL) / 2 + fL;
  } else {
    left = (fL - tL) / 2 + tL;
  }

  if (
    (fT < tT && fL < tL)
    || (tT < fT && tL < fL)
    || (fT > tT && fL > tL)
    || (tT > fT && tL > fL)
  ) {
    ANG *= -1;
  }
  top -= H / 2;

  line.style['-webkit-transform'] = `rotate(${ANG}deg)`;
  line.style['-moz-transform'] = `rotate(${ANG}deg)`;
  line.style['-ms-transform'] = `rotate(${ANG}deg)`;
  line.style['-o-transform'] = `rotate(${ANG}deg)`;
  line.style['-transform'] = `rotate(${ANG}deg)`;
  line.style.top = `${top}px`;
  line.style.left = `${left}px`;
  line.style.height = `${H}px`;
};

function DeepCopyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}


const DocumentPage = (props) => {
  const {
    document, annotations, initAlerts,
  } = props;

  const [alerts, setAlerts] = useState(initAlerts || []);
  const [documentHighlightedAndLoaded, setDocumentHighlightedAndLoaded] = useState(false);
  const [channelAnnotations, setChannelAnnotations] = useState({ left: null, right: null });
  const [documentFilters, setDocumentFilters] = useState({
    annotationIds: { left: null, right: null },
    filters: {
      annotatedBy: [], // list of filter options that have been selected by user
      byTags: [], // list of filter options that have been selected by user},
      permissions: 0,
    },
  });
  const [annotationChannel1Loaded, setAnnotationChannel1Loaded] = useState(false);
  const [annotationChannel2Loaded, setAnnotationChannel2Loaded] = useState(false);

  const [session, loading] = useSession();

  const saveAnnotationChanges = (anno, side) => {
    const index = channelAnnotations[side].findIndex((a) => a._id === anno._id);
    channelAnnotations[side][index] = anno;
    setChannelAnnotations(channelAnnotations);
  };

  const highlightText = async (obj, domElement) => {
    const selector = createTextQuoteSelector(obj.selector);
    const matches = selector(domElement);
    for await (const range of matches) {
      // calls matches.next() -> Promise -> resolves -> returns -> {value: '', done: boolean}
      highlightRange(range, 'span', { ...obj.props });
    }
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

  const addAnnotationToChannels = (side, newAnnotation) => {
    // we need to figure out where we need to add this new annotation inside this annotations array
    let indexForNewAnnotation = channelAnnotations[side].findIndex((annotation) => {
      // if the tops are the same then we have to distinguish which
      // annotation comes first by who has the smaller left value
      if (newAnnotation.position.top - annotation.position.top === 0) {
        return newAnnotation.position.left < annotation.position.left;
      }
      return newAnnotation.position.top < annotation.position.top;
    });

    // make sure that if we can't find a place to put the new annotation
    // we put it at the end of the existing list of annotations
    indexForNewAnnotation = indexForNewAnnotation === -1
      ? channelAnnotations[side].length
      : indexForNewAnnotation;


    // updating annotation channel data with new annotation

    let newChannelAnnotations = DeepCopyObj(channelAnnotations);
    newChannelAnnotations[side].splice(indexForNewAnnotation, 0, newAnnotation);
    setChannelAnnotations(newChannelAnnotations);
  };

  const deleteAnnotationFromChannels = (side, annotationID) => {
    const annotationIndex = channelAnnotations[side]
      .findIndex(
        (annotation) => annotation._id === annotationID,
      );
     
    let newChannelAnnotations = DeepCopyObj(channelAnnotations);
    newChannelAnnotations[side].splice(annotationIndex, 1);
    setChannelAnnotations(newChannelAnnotations);
  };

  const moveAnnotationsToCorrectSpotBasedOnFocus = (side, focusID) => {
    const annos = channelAnnotations[side];
    // this function will focus the annotation that has been clicked on
    // in the channel. It works very similar to the function
    // "PlaceAnnotationsInCorrectSpot"

    // first we need to find the index of the annotation
    // we want to focus on in the annotations array
    const focusIndex = annos.findIndex((annotation) => annotation._id === focusID);


    // first we need to focus the annotation and then place all other
    // annotations after it under it
    const tempTopAdjustment = 0;
    const documentContainerOffset = $('#document-container').offset();
    let lastHighestPoint = -1000;
    const marginBottom = 8;
    const adjustmentTopNumber = 6;
    let top;
    let trueTop;
    const offsetLeftForLine1 = side === 'left'
      ? $('#document-card-container').offset().left + 25
      : -40;
    for (let i = focusIndex; i < annos.length; i += 1) {
      if (documentFilters.annotationIds[side] !== null) { // this means that there are filters applied to the document
        if (!documentFilters.annotationIds[side].includes(annos[i]._id)) { continue; }
      }


      const offsetLeftForLine2 = side === 'left'
        ? annos[i].position.left
        : annos[i].position.left - $(`#document-container #${annos[i]._id}`).offset().left;
      trueTop = annos[i].position.top
        - documentContainerOffset.top
        + tempTopAdjustment
        - adjustmentTopNumber;
      if (lastHighestPoint > trueTop) {
        top = lastHighestPoint + marginBottom;
      } else {
        top = trueTop;
      }

      lastHighestPoint = top + $(`#document-container #${annos[i]._id}`).height();
      $(`#document-container #${annos[i]._id}`).css('top', `${top}px`);
      // now that we have placed the annotation in its correct spot
      // we need to set the line that visually connects the annotation to the text

      // setting line 1
      adjustLine(
        $(`#document-container #${annos[i]._id} .annotation-pointer-${side}`).get(0),
        {
          offsetTop: trueTop - top + 13,
          offsetLeft: offsetLeftForLine1,
          offsetWidth: 0,
          offsetHeight: 0,
        },
        $(`#document-container #${annos[i]._id} .line1`).get(0),
      );
      // setting line 2 which will have the beginning point of line 1 endpoint
      adjustLine(
        {
          offsetTop: trueTop - top + 13,
          offsetLeft: offsetLeftForLine1,
          offsetWidth: 0,
          offsetHeight: 0,
        },
        {
          offsetTop: trueTop - top + 13,
          offsetLeft: offsetLeftForLine2,
          offsetWidth: 0,
          offsetHeight: 0,
        },
        $(`#document-container #${annos[i]._id} .line2`).get(0),
      );
    }

    // the next thing we need to do is place all annotations
    // before the focus annotation in its correct position
    // the lowest point an annotation can reach is the
    // current top position of the focused index annotation
    let lastLowestPoint = annos[focusIndex].position.top
      - documentContainerOffset.top
      + tempTopAdjustment
      - adjustmentTopNumber;
    for (let i = focusIndex - 1; i >= 0; i -= 1) {

      if (documentFilters.annotationIds[side] !== null) { // this means that there are filters applied to the document
        if (!documentFilters.annotationIds[side].includes(annos[i]._id)) { continue; }
      }

      const offsetLeftForLine2 = side === 'left'
        ? annos[i].position.left
        : annos[i].position.left - $(`#document-container #${annos[i]._id}`).offset().left;
      // this is where the annotation wants to be
      trueTop = annos[i].position.top
        - documentContainerOffset.top
        + tempTopAdjustment
        - adjustmentTopNumber;
      // if where you are is greater than where you can be then we have to set your
      // position to where you can be. Otherwise just set your position to where you are
      if (
        lastLowestPoint - $(`#document-container #${annos[i]._id}`).height() - marginBottom
        < $(`#document-container #${annos[i]._id}`).position().top
      ) {
        top = lastLowestPoint - $(`#document-container #${annos[i]._id}`).height() - marginBottom;
      } else {
        top = $(`#document-container #${annos[i]._id}`).position().top;
      }

      lastLowestPoint = top;
      $(`#document-container #${annos[i]._id}`).css('top', `${top}px`);
      // now that we have placed the annotation in its correct spot we
      // need to set the line that visually connects the annotation to the text

      // setting line 1
      adjustLine(
        $(`#document-container #${annos[i]._id} .annotation-pointer-${side}`).get(0),
        {
          offsetTop: trueTop - top + 13,
          offsetLeft: offsetLeftForLine1,
          offsetWidth: 0,
          offsetHeight: 0,
        },
        $(`#document-container #${annos[i]._id} .line1`).get(0),
      );
      // setting line 2 which will have the beginning point of line 1 endpoint
      adjustLine(
        {
          offsetTop: trueTop - top + 13,
          offsetLeft: offsetLeftForLine1,
          offsetWidth: 0,
          offsetHeight: 0,
        }, {
          offsetTop: trueTop - top + 13,
          offsetLeft: offsetLeftForLine2,
          offsetWidth: 0,
          offsetHeight: 0,
        },
        $(`#document-container #${annos[i]._id} .line2`).get(0),
      );
    }
  };


  return (
    <DocumentAnnotationsContext.Provider value={[channelAnnotations, setChannelAnnotations, saveAnnotationChanges]}>
      <DocumentFiltersContext.Provider value={[documentFilters, setDocumentFilters]}>
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
          annotations={channelAnnotations}
        >
          <Row id="document-container">
            <Col sm={3}>
              <AnnotationChannel
                deleteAnnotationFromChannels={deleteAnnotationFromChannels}
                setAnnotationChannelLoaded={setAnnotationChannel1Loaded}
                focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
                loaded={annotationChannel1Loaded}
                side="left"
                annotations={channelAnnotations.left}
                documentFilters={documentFilters}
                user={session ? session.user : undefined}
              />
            </Col>
            <Col sm={6}>
              <Card id="document-card-container">
                <Card.Body>
                  <Document
                    setChannelAnnotations={
                    (annos) => {
                      setChannelAnnotations(annos);
                      setDocumentHighlightedAndLoaded(true);
                    }
                  }
                    annotations={annotations}
                    documentHighlightedAndLoaded={documentHighlightedAndLoaded}
                    addAnnotationToChannels={addAnnotationToChannels}
                    annotateDocument={
                    (mySelector, annotationID) => {
                      highlightTextToAnnotate(mySelector, annotationID);
                    }
                  }
                    documentToAnnotate={document}
                    alerts={alerts}
                    setAlerts={setAlerts}
                    user={session ? session.user : undefined}
                  />
                </Card.Body>
              </Card>
            </Col>
            <Col sm={3}>
              <AnnotationChannel
                deleteAnnotationFromChannels={deleteAnnotationFromChannels}
                setAnnotationChannelLoaded={setAnnotationChannel2Loaded}
                focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
                loaded={annotationChannel2Loaded}
                side="right"
                annotations={channelAnnotations.right}
                documentFilters={documentFilters}
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
      </DocumentFiltersContext.Provider>

    </DocumentAnnotationsContext.Provider>

  );
};

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
      initAlerts: [{ text: err.message, variant: 'danger' }],
    };
  });

  // after we get the document data we need to get the annotations on this document data
  await prefetchSharedAnnotationsOnDocument(slug, context.req.headers.cookie)
    .then((annotations) => {
      props.annotations = annotations;
    }).catch((err) => {
      props = {
        initAlerts: [{ text: err.message, variant: 'danger' }],
      };
    });

  return { props };
}

export default DocumentPage;
