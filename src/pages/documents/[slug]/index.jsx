/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { useState, useEffect } from 'react';
import { isMobile } from "react-device-detect"
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
import HeatMap from '../../../components/HeatMap';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AnnotationChannel from '../../../components/AnnotationChannel';
import Document from '../../../components/Document';
import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import { prefetchSharedAnnotationsOnDocument } from '../../../utils/annotationUtil';
import { DocumentAnnotationsContext, DocumentFiltersContext, DocumentContext } from '../../../contexts/DocumentContext';
import { getGroupById } from '../../../utils/groupUtil';
import { FirstNameLastInitial } from '../../../utils/nameUtil';


const adjustLine = (from, to, line) => {
  if (from === undefined || to === undefined || line === undefined) { return; }
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
    document, annotations, initAlerts, query, statefulSession,
  } = props;

  let validQuery = false;
  let defaultPermissions = 0;
  if ((query && (query.mine === 'true' || query.mine === 'false')) && query.aid !== undefined) {
    if (annotations.find((anno) => anno._id === query.aid) !== undefined) {
      validQuery = true;
      defaultPermissions = query.mine === 'true' ? 0 : 1;
    }
  }

  const [alerts, setAlerts] = useState(initAlerts || []);
  const [documentHighlightedAndLoaded, setDocumentHighlightedAndLoaded] = useState(false);
  const [channelAnnotations, setChannelAnnotations] = useState({ left: null, right: null });
  const [documentFilters, setDocumentFilters] = useState({
    filterOnInit: true,
    annotationsLoaded: false,
    annotationIds: { left: null, right: null },
    filters: {
      annotatedBy: [], // list of filter options that have been selected by user
      byTags: [], // list of filter options that have been selected by user},
      permissions: defaultPermissions,
    },
  });
  const [annotationChannel1Loaded, setAnnotationChannel1Loaded] = useState(false);
  const [annotationChannel2Loaded, setAnnotationChannel2Loaded] = useState(false);
  const minDisplayWidth = 1150;
  // if true annotations will displayed in channels otherwise they will be displayed as popovers that show on hover or on click
  const [displayAnnotationsInChannels, setDisplayAnnotationsInChannels] = useState(!isMobile);

  const [scrollToAnnotation, setScrollToAnnotation] = useState(validQuery);

  const [showMoreInfoShareModal, setShowMoreInfoShareModal] = useState();

  const [session, loading] = useSession();
  // the interesection between the groups that this user is in and the groups the document is shared too
  const [groupIntersection, setGroupIntersection] = useState();
  // the people the user can share their annotations with which is generated from the groupIntersection
  const [membersIntersection, setMembersIntersection] = useState([]);


  function getAllTags() {
    let tags = [];
    const sides = ['left', 'right'];
    for (let j = 0; j < sides.length; j += 1) {
      const annos = channelAnnotations[sides[j]];
      if (annos !== null) {
        for (let i = 0; i < annos.length; i += 1) {
          tags = tags.concat(annos[i].body.tags);
        }
      }
    }
    return tags.filter((value, index, self) => self.indexOf(value) === index).sort();
  }

  const saveAnnotationChanges = (anno, side) => {
    const index = channelAnnotations[side].findIndex((a) => a._id === anno._id);
    channelAnnotations[side][index] = DeepCopyObj(anno);
    setChannelAnnotations(DeepCopyObj(channelAnnotations));
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

    await highlightText(obj, $('#document-content-container').get(0));
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

    const newChannelAnnotations = DeepCopyObj(channelAnnotations);
    newChannelAnnotations[side].splice(indexForNewAnnotation, 0, newAnnotation);
    setChannelAnnotations(newChannelAnnotations);
    setDocumentFilters(Object.assign(DeepCopyObj(documentFilters), { filterOnInit: true }));
  };

  const deleteAnnotationFromChannels = (side, annotationID) => {
    const annotationIndex = channelAnnotations[side]
      .findIndex(
        (annotation) => annotation._id === annotationID,
      );

    const newChannelAnnotations = DeepCopyObj(channelAnnotations);
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
      if (documentFilters.annotationIds[side] === null
        || !documentFilters.annotationIds[side].includes(annos[i]._id)) {
        continue;
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
      if (documentFilters.annotationIds[side] === null
        || !documentFilters.annotationIds[side].includes(annos[i]._id)) {
        continue;
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

  useEffect(() => {
    // when both annotation channels are loaded we are going to check the query data and
    // if there is a key 'mine' and 'aid', and 'aid' value actually equals an annotation
    // id that we have then we will trigger scroll to the annotation

    if (scrollToAnnotation) {
      if (annotationChannel1Loaded && annotationChannel2Loaded) {
        if (!documentFilters.filterOnInit) {
          const f = DeepCopyObj(documentFilters);
          f.filterOnInit = true;
          setDocumentFilters(f);
        } else {
          const anno = $(`#${query.aid}.annotation-card-container`);
          if (anno.length !== 0) {
            const scrollTo = anno.offset().top - $('#document-container').offset().top - 40;
            setScrollToAnnotation(false);
            $('#document-container').animate({
              scrollTop: scrollTo < 0 ? 0 : scrollTo,
            }, 500, () => {
              anno.children('.annotation-header').trigger('click');
            });
          }
        }
      }
    }
  });

  useEffect(() => {
    window.addEventListener('resize', () => {
      setDisplayAnnotationsInChannels(window.innerWidth > minDisplayWidth && !isMobile);
    });
  });

  async function getIntersectionOfGroupsAndUsers() {
    // when the session gets loaded in we are going to get the intersection of groups and the users that applies to
    if (session !== undefined && groupIntersection === undefined) { // this means we haven't set it yet
      const userGroupIds = session.user.groups.map((g) => g.id);
      const intersection = userGroupIds.filter((id) => document.groups.includes(id));
      const intersectionGroups = await Promise.all(intersection.map((id) => getGroupById(id)));
      let intersectionMembers = [];
      for (let i = 0; i < intersectionGroups.length; i += 1) {
        // filtering out members for this specific group that we have already included in the intersectionMembers array
        const members = intersectionGroups[i].members.filter((m) => !intersectionMembers.some((im) => im.id === m.id));
        intersectionMembers = intersectionMembers.concat(members);
      }
      // before we set the intersection of members we need to remove the id of the current user session
      setMembersIntersection(intersectionMembers.filter((m) => m.id !== session.user.id).map((m) => ({ ...m, name: FirstNameLastInitial(m.name) })));
      setGroupIntersection(intersectionGroups);
    }
  }

  useEffect(() => {
    getIntersectionOfGroupsAndUsers();
  }, [session]);

  useEffect(() => {
    if (annotationChannel1Loaded && annotationChannel2Loaded) {
      setDocumentFilters({ ...documentFilters, annotationsLoaded: true });
    }
  }, [annotationChannel1Loaded, annotationChannel2Loaded]);


  return (

    <DocumentContext.Provider value={document}>
      <DocumentAnnotationsContext.Provider value={[channelAnnotations, setChannelAnnotations, saveAnnotationChanges, getAllTags()]}>
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
            document={document}
            alerts={alerts}
            docView
            statefulSession={statefulSession}
          >
            <HeatMap pdf={document.uploadContentType === 'text/pdf'} />
            {document && (
            <>
              <Row id="document-container">

                <Col className="annotation-channel-container">
                  <AnnotationChannel
                    deleteAnnotationFromChannels={deleteAnnotationFromChannels}
                    setAnnotationChannelLoaded={setAnnotationChannel1Loaded}
                    focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
                    side="left"
                    annotations={channelAnnotations.left}
                    user={session ? session.user : undefined}
                    showMoreInfoShareModal={showMoreInfoShareModal}
                    setShowMoreInfoShareModal={setShowMoreInfoShareModal}
                    membersIntersection={membersIntersection}
                  />
                </Col>

                <Col style={{ minWidth: 750, maxWidth: 750 }}>
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
                        async (mySelector, annotationID) => {
                          await highlightTextToAnnotate(mySelector, annotationID);
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

                <Col className="annotation-channel-container">
                  <AnnotationChannel
                    deleteAnnotationFromChannels={deleteAnnotationFromChannels}
                    setAnnotationChannelLoaded={setAnnotationChannel2Loaded}
                    focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
                    side="right"
                    annotations={channelAnnotations.right}
                    user={session ? session.user : undefined}
                    showMoreInfoShareModal={showMoreInfoShareModal}
                    setShowMoreInfoShareModal={setShowMoreInfoShareModal}
                    membersIntersection={membersIntersection}
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
              <Modal
                show={showMoreInfoShareModal}
                onHide={() => { setShowMoreInfoShareModal(); }}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
              >
                <Modal.Header closeButton>
                  <Modal.Title id="contained-modal-title-vcenter" style={{ fontWeight: 400 }}>
                    Sharing Annotation Options
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 5 }}>Private</p>
                  <p style={{ fontSize: 14 }}>
                    Only you can see the annotation
                  </p>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 5 }}>Share with group(s)</p>
                  <p style={{ fontSize: 14 }}>
                    Share this annotation with all members of your group(s) who have access to this document.
                  </p>
                  <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 5 }}>Share with user(s)</p>
                  <p style={{ fontSize: 14 }}>
                    Share this annotation with a specific user or users only.
                  </p>
                </Modal.Body>
              </Modal>
            </>
            )}
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
            padding: 
            ${document.uploadContentType === 'text/pdf' ? '0' : '10px 0px'};
          }

          ${document.uploadContentType === 'text/pdf' ? 'img.bi { display: none; }' : ''}

          #document-container::-webkit-scrollbar {
            background: transparent;
            width: 10px;
            border-radius: 8px;
          }

          #document-container::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.1);
            border: 1px solid rgba(0,0,0,0.6);
            border-radius: 8px;
          }

          #document-container .annotation-channel-container{
            width: calc(50vw - 375px)
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
            box-shadow: ${document.uploadContentType === 'text/pdf'
              ? 'none'
              : '3px 3px 9px 0px rgba(0,0,0,0.38)'
            };
            ${document.uploadContentType === 'text/pdf' ? 'background: none;' : ''}
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
    </DocumentContext.Provider>


  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  let props = { query: context.query };
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
