/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { useState, useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { useSession } from 'next-auth/client';
import $ from 'jquery';
import {
  Row,
  Col,
  Modal,
  ProgressBar,
} from 'react-bootstrap';
import {
  createTextQuoteSelector,
  highlightRange,
} from 'apache-annotator/dom';
import unfetch from 'unfetch';
import debounce from 'lodash.debounce';
import HeatMap from '../../../components/HeatMap';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import AnnotationChannel from '../../../components/AnnotationChannel';
import Document from '../../../components/Document';
import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import { prefetchSharedAnnotationsOnDocument } from '../../../utils/annotationUtil';
import {
  DocumentAnnotationsContext,
  DocumentFiltersContext,
  DocumentContext,
  DocumentActiveAnnotationsContext,
} from '../../../contexts/DocumentContext';
import { getGroupById } from '../../../utils/groupUtil';
import { FirstNameLastInitial } from '../../../utils/nameUtil';
import AnnotationsOverlay from '../../../components/AnnotationsOverlay';
import UnsavedChangesToast from '../../../components/UnsavedChangesToast/UnsavedChangesToast';
import adjustLine from '../../../utils/docUIUtils';


function DeepCopyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}


const DocumentPage = ({
  document, annotations, initAlerts, query, statefulSession,
}) => {
  let validQuery = false;
  let defaultPermissions = 0;
  if ((query && (query.mine === 'true' || query.mine === 'false')) && query.aid !== undefined) {
    if (annotations.find((anno) => anno._id === query.aid) !== undefined) {
      validQuery = true;
      defaultPermissions = query.mine === 'true' ? 0 : 1;
    }
  }

  const documentIsPDF = document && document.uploadContentType && document.uploadContentType.includes('pdf');

  const focusedAnnotationsRef = useRef({ left: null, right: null }).current;
  const debouncedRepositioning = useRef(
    debounce((nextZoom, filteredAnnotationIds, channelAnnotations, setChannelAnnotations) => {
      if (channelAnnotations.left === null || channelAnnotations.right === null) { return; }
      for (const s of ['left', 'right']) {
        for (const anno of channelAnnotations[s]) {
          const annotationBeginning = $(`#document-content-container span[annotation-id='${anno._id}'] .annotation-beginning-marker`);
          const annotationBeginningPositionTop = annotationBeginning.offset().top + $('#document-container').scrollTop();
          anno.position.top = annotationBeginningPositionTop;
        }
      }

      setChannelAnnotations(DeepCopyObj(channelAnnotations));
    }, 1000),
  ).current;

  const [alerts, setAlerts] = useState(initAlerts || []);
  const [documentHighlightedAndLoaded, setDocumentHighlightedAndLoaded] = useState(false);
  const [annotationIdBeingEdited, setAnnotationIdBeingEdited] = useState();
  const [showUnsavedChangesToast, setShowUnsavedChangesToast] = useState();
  const [documentZoom, setDocumentZoom] = useState(100);
  const [activeAnnotations, setActiveAnnotations] = useState({ annotations: [], target: null });
  const [channelAnnotations, setChannelAnnotations] = useState({ left: null, right: null });
  const [expandedAnnotations, setExpandedAnnotations] = useState([]);
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
  const [
    annotationChannel1Loaded, setAnnotationChannel1Loaded,
  ] = useState(annotations.length === 0);
  const [
    annotationChannel2Loaded, setAnnotationChannel2Loaded,
  ] = useState(annotations.length === 0);
  const minDisplayWidth = 1150;
  // popovers for mobile
  // eslint-disable-next-line no-unused-vars
  const [displayAnnotationsInChannels, setDisplayAnnotationsInChannels] = useState(!isMobile);
  const [
    annotationIdToScrollTo,
    setAnnotationIdToScrollTo,
  ] = useState(validQuery ? query.aid : undefined);

  const [showMoreInfoShareModal, setShowMoreInfoShareModal] = useState();

  const [session, loading] = useSession();
  // interesection between user's groups and groups the document is shared to
  const [groupIntersection, setGroupIntersection] = useState();
  // other users this user can share annotations with, generated from groupIntersection
  const [membersIntersection, setMembersIntersection] = useState([]);

  const expandAnnotation = (aid, expand) => {
    const aidExistInList = expandedAnnotations.includes(aid);
    let newExpandedAnnotations = expandedAnnotations.slice();
    if (expand && !aidExistInList) {
      newExpandedAnnotations.push(aid);
      setExpandedAnnotations(newExpandedAnnotations);
    } else if (aidExistInList) {
      newExpandedAnnotations = newExpandedAnnotations.filter((id) => id !== aid);
      setExpandedAnnotations(newExpandedAnnotations);
    }
  };


  // functions for filtering

  function ByPermissionsFilterMatch(userEmail, email, permissions, cf, userId) { // AND FUNCTION
    if (cf.permissions === 0 && userEmail === email) { // mine
      return true;
    }

    if (cf.permissions === 1 && !permissions.private && !permissions.sharedTo) { // shared
      return true;
    }

    if (cf.permissions === 2 && permissions.sharedTo !== undefined) { // shared with specific people
      return permissions.sharedTo.includes(userId);
    }
  }

  function AnnotatedByFilterMatch(email, cf) { // AND FUNCTION
    return cf.annotatedBy.length === 0 ? true : cf.annotatedBy.includes(email);
  }

  function ByTagFilterMatch(tags, cf) { // OR FUNCTION
    if (cf.byTags.length === 0) {
      return true;
    }

    if (tags === undefined) {
      return false;
    }

    for (let i = 0; i < tags.length; i += 1) {
      if (cf.byTags.includes(tags[i])) {
        return true;
      }
    }
    return false;
  }


  const AnnotationMatchesFilters = (
    userEmail, a, filters, userId,
  ) => AnnotatedByFilterMatch(a.creator.email, filters)
    && ByTagFilterMatch(a.body.tags, filters)
    && ByPermissionsFilterMatch(userEmail, a.creator.email, a.permissions, filters, userId);

  const FilterAnnotations = (channelAnnos, filters) => {
    const userEmail = session.user.email;
    const userId = session.user.id;
    const annotationIds = { left: [], right: [] };
    for (const side in annotationIds) {
      if (Array.isArray(channelAnnos[side])) {
        for (const a of channelAnnos[side]) {
          if (AnnotationMatchesFilters(userEmail, a, filters, userId)) {
            annotationIds[side].push(a._id);
          }
        }
      }
    }

    return annotationIds;
  };


  function addActiveAnnotation(annoId, target) {
    if (!activeAnnotations.annotations.includes(annoId)) {
      const newActiveAnnotations = activeAnnotations.annotations.slice();
      newActiveAnnotations.push(annoId);
      setActiveAnnotations({ target, annotations: newActiveAnnotations });
    }
  }

  function removeActiveAnnotation(annoId) {
    const newActiveAnnotations = activeAnnotations.annotations.filter((aid) => aid !== annoId);
    setActiveAnnotations({
      target: null,
      annotations: newActiveAnnotations,
    });
  }


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
    setAnnotationIdBeingEdited(anno.editing ? anno._id : undefined);
  };

  const scrollToAnnotation = () => {
    if (annotationIdBeingEdited !== undefined) {
      setAnnotationIdToScrollTo(annotationIdBeingEdited);
    }
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
    setDocumentFilters({ ...documentFilters, filterOnInit: true });
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

    if (focusIndex !== -1) {
      focusedAnnotationsRef[side] = focusID;
    }


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
        || (!documentFilters.annotationIds[side].includes(annos[i]._id) && !annos[i].new)) {
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
        || (!documentFilters.annotationIds[side].includes(annos[i]._id) && !annos[i].new)) {
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

    if (annotationIdToScrollTo !== undefined) {
      if (annotationChannel1Loaded && annotationChannel2Loaded) {
        if (!documentFilters.filterOnInit) {
          setDocumentFilters({ ...documentFilters, filterOnInit: true });
        } else {
          const anno = $(`#${annotationIdToScrollTo}.annotation-card-container`);
          if (anno.length !== 0) {
            const currentScrollValue = $('#document-container').scrollTop();
            const scrollTo = currentScrollValue + anno.offset().top - $('#document-container').offset().top - 40;
            setAnnotationIdToScrollTo(undefined);
            $('#document-container').animate({
              scrollTop: scrollTo < 0 ? 0 : scrollTo,
            }, 500, () => {
              anno.children('.annotation-header').trigger('click');
            });
          }
        }
      }
    }
  }, [annotationIdToScrollTo, documentFilters]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', () => {
      // eslint-disable-next-line no-undef
      setDisplayAnnotationsInChannels(window.innerWidth > minDisplayWidth && !isMobile);
    });
  });

  async function getIntersectionOfGroupsAndUsers() {
    // when session loaded, get intersection of groups and the users that applies to
    if (session && document && !groupIntersection) {
      const userGroupIds = session.user.groups.map((g) => g.id);
      const intersection = userGroupIds.filter((id) => document.groups.includes(id));
      const intersectionGroups = await Promise.all(intersection.map((id) => getGroupById(id)));
      let intersectionMembers = [];
      for (let i = 0; i < intersectionGroups.length; i += 1) {
        // filtering out members for this specific group
        // that we have already included in the intersectionMembers array
        const members = intersectionGroups[i].members
          // eslint-disable-next-line no-loop-func
          .filter((m) => !intersectionMembers.some((im) => im.id === m.id));
        intersectionMembers = intersectionMembers.concat(members);
      }
      // remove id of current user session before setting intersection of members
      setMembersIntersection(intersectionMembers
        .filter((m) => m.id !== session.user.id)
        .map((m) => ({ ...m, name: FirstNameLastInitial(m.name) })));
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

  const [documentLoading, setDocumentLoading] = useState(true);

  const cloudfrontUrl = process.env.NEXT_PUBLIC_SIGNING_URL.split('/url')[0];

  useEffect(() => {
    if (document && document.text
      && document.text.length < 255 && document.text.includes(cloudfrontUrl)) {
      unfetch(document.text.substring(
        document.text.indexOf(cloudfrontUrl), document.text.indexOf('.html') + 5,
      ), {
        method: 'GET',
        headers: {
          'Content-Type': 'text/html',
        },
      }).then((res) => {
        res.text().then((result) => {
          document.text = result;
          setDocumentLoading(false);
        });
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        setDocumentLoading(false);
      });
    } else {
      setDocumentLoading(false);
    }
  }, [document]);


  useEffect(() => {
    debouncedRepositioning(
      documentZoom,
      documentFilters.annotationIds,
      channelAnnotations,
      setChannelAnnotations,
    );
  }, [documentZoom]);

  return (
    <DocumentActiveAnnotationsContext.Provider value={[activeAnnotations, setActiveAnnotations]}>
      <DocumentContext.Provider value={[document, documentZoom, setDocumentZoom]}>
        <DocumentAnnotationsContext.Provider
          value={[
            channelAnnotations,
            setChannelAnnotations,
            expandedAnnotations,
            expandAnnotation,
            saveAnnotationChanges,
            getAllTags(),
            annotationIdBeingEdited,
            setShowUnsavedChangesToast,
            scrollToAnnotation,
          ]}
        >
          <DocumentFiltersContext.Provider
            value={[documentFilters, setDocumentFilters, FilterAnnotations]}
          >
            <Layout
              type="document"
              document={document}
              alerts={alerts}
              docView
              statefulSession={statefulSession}
            >
              {!session && loading && (
              <LoadingSpinner />
              )}
              {!session && !loading && (
              <>You must be logged in to view this page.</>
              )}
              {session && !loading && (!document || documentLoading) && (
                <LoadingSpinner />
              )}
              {session && !loading && document && !documentLoading && (
                <>
                  <UnsavedChangesToast
                    show={showUnsavedChangesToast}
                    onClose={() => { setShowUnsavedChangesToast(); }}
                    scrollToAnnotation={scrollToAnnotation}
                  />
                  <HeatMap
                    pdf={documentIsPDF}
                    documentZoom={documentZoom}
                  />
                  {!displayAnnotationsInChannels && <AnnotationsOverlay />}
                  <Row id="document-container">
                    <AnnotationChannel
                      show={displayAnnotationsInChannels}
                      deleteAnnotationFromChannels={deleteAnnotationFromChannels}
                      setAnnotationChannelLoaded={setAnnotationChannel1Loaded}
                      focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
                      side="left"
                      focusedAnnotation={focusedAnnotationsRef.left}
                      annotations={channelAnnotations.left}
                      user={session ? session.user : undefined}
                      showMoreInfoShareModal={showMoreInfoShareModal}
                      setShowMoreInfoShareModal={setShowMoreInfoShareModal}
                      membersIntersection={membersIntersection}
                      alerts={alerts}
                      setAlerts={setAlerts}
                    />
                    <Col
                      id="document-container-col"
                      style={{
                        transform: `scale(${documentZoom / 100}) translateY(0px)`,
                        transformOrigin: 'top center',
                        minWidth: 750,
                        // marginLeft: (documentZoom - 100) * 4,
                        // marginRight: (documentZoom - 100) * 4,
                      }}
                    >
                      <Document
                        addActiveAnnotation={addActiveAnnotation}
                        removeActiveAnnotation={removeActiveAnnotation}
                        displayAnnotationsInChannels={displayAnnotationsInChannels}
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
                    </Col>
                    <AnnotationChannel
                      show={displayAnnotationsInChannels}
                      deleteAnnotationFromChannels={deleteAnnotationFromChannels}
                      setAnnotationChannelLoaded={setAnnotationChannel2Loaded}
                      focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
                      side="right"
                      focusedAnnotation={focusedAnnotationsRef.right}
                      annotations={channelAnnotations.right}
                      user={session ? session.user : undefined}
                      showMoreInfoShareModal={showMoreInfoShareModal}
                      setShowMoreInfoShareModal={setShowMoreInfoShareModal}
                      membersIntersection={membersIntersection}
                      alerts={alerts}
                      setAlerts={setAlerts}
                    />
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
                      <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 5 }}>
                        Share with group(s)
                      </p>
                      <p style={{ fontSize: 14 }}>
                        Share this annotation with all members of
                        your group(s) who have access to this document.
                      </p>
                      <p style={{ fontWeight: 600, fontSize: 16, marginBottom: 5 }}>
                        Share with user(s)
                      </p>
                      <p style={{ fontSize: 14 }}>
                        Share this annotation with a specific user or users only.
                      </p>
                    </Modal.Body>
                  </Modal>
                </>
              )}
            </Layout>
            <style jsx global>
              {`
              #annotations-header-label {
                padding: 12px 0px 0px 20px;
              }

              #document-container {
                height: calc(100vh - 230px);
                overflow-y: scroll;
                padding: 
                ${documentIsPDF ? '0' : '10px 0px'};
              }

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
                width: calc(50vw - 375px);
                height: 0px;
              }
              
              #document-container #annotation-well-card-container {
                min-height: 100%;
                background-color: transparent;
              }

              #document-container #document-card-container {
                padding: 40px;
                font-family: 'Times';
                border-radius: 0px;
                border: none;
                box-shadow: ${documentIsPDF
                ? 'none'
                : '3px 3px 9px 0px rgba(0,0,0,0.38)'
                };
                ${documentIsPDF ? 'background: none;' : ''}
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
    </DocumentActiveAnnotationsContext.Provider>
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  let props = { query: context.query };
  await prefetchDocumentBySlug(slug, context.req.headers.cookie).then(async (response) => {
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
