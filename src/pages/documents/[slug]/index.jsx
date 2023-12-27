/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { useState, useEffect, useRef, useContext } from 'react';
import { useSession } from 'next-auth/react';
import $ from 'jquery';
import {
  Badge,
  Button,
  Dropdown,
  DropdownButton,
  ListGroup,
  Modal,
  Overlay,
  OverlayTrigger,
  Popover,
  ProgressBar,
  Toast,
} from 'react-bootstrap';
import {
  ArchiveFill, PencilFill, ChatLeftTextFill, BellSlash, EyeSlash, Eye, Bell, BroadcastPin,
} from 'react-bootstrap-icons';
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
import { getDocumentTextAnalysis, getManyGroupNamesById, prefetchDocumentBySlug } from '../../../utils/docUtil';
import { fetchSharedAnnotationsOnDocument, MAX_NUMBER_OF_ANNOTATIONS_REQUESTED } from '../../../utils/annotationUtil';
import {
  DocumentAnnotationsContext,
  DocumentFiltersContext,
  DocumentContext,
  DocumentActiveAnnotationsContext,
  WebsocketContext,
} from '../../../contexts/DocumentContext';
import { getGroupById } from '../../../utils/groupUtil';
import { FirstNameLastInitial } from '../../../utils/nameUtil';
import AnnotationsOverlay from '../../../components/AnnotationsOverlay';
import UnsavedChangesToast from '../../../components/UnsavedChangesToast/UnsavedChangesToast';
import adjustLine, { DeepCopyObj, RID } from '../../../utils/docUIUtils';
import Footer from '../../../components/Footer';
import { annotatedByFilterMatch, byGroupFilterMatch, byPermissionsDocumentViewFilterMatch, byTagFilterMatch } from '../../../utils/annotationFilteringUtil';
import MaxedTextLengthToast from '../../../components/MaxedTextLengthToast';
import MaxedAnnotationLengthToast from '../../../components/MaxedAnnotationLengthToast';
import RunTextAnalysisModal from '../../../components/RunTextAnalysisModal';
import { groupBy } from 'lodash';
import moment from 'moment';


const DocumentPage = ({
  document, annotations, initAlerts, query, statefulSession,
}) => {
  const dashboardState = `${query && query.did !== undefined && query.slug !== undefined ? `did=${query.did}&slug=${query.slug}&dp=${query.dp}&` : ''}gid=${query && query.gid}`;
  let validQuery = false;
  let defaultPermissions = 0;
  if ((query && (query.mine === 'true' || query.mine === 'false' || query.sharedWithMe === 'true')) && query.aid !== undefined) {
    if (annotations.find((anno) => anno._id === query.aid) !== undefined) {
      validQuery = true;
      const defaultP = query.sharedWithMe === 'true' ? 2 : 1;
      defaultPermissions = query.mine === 'true' ? 0 : defaultP;
    }
  }

  const documentIsPDF = document && document.uploadContentType && document.uploadContentType.includes('pdf');


  const targetWebsocketContainer = useRef(null);

  const focusedAnnotationsRef = useRef({ left: null, right: null }).current;
  const debouncedRepositioning = useRef(
    debounce((channelAnnotations, setChannelAnnotations) => {
      if (channelAnnotations.left === null || channelAnnotations.right === null) { return; }
      for (const s of ['left', 'right']) {
        for (const anno of channelAnnotations[s]) {
          const annotationBeginning = $(`#document-content-container span[annotation-id='${anno._id}'] .annotation-beginning-marker`);
          const annotationBeginningPositionTop = annotationBeginning.offset().top + $('#document-container').scrollTop();
          const annotationBeginningPositionLeft = annotationBeginning.offset().left + $('#document-container').scrollLeft();
          anno.position.left = annotationBeginningPositionLeft;
          anno.position.top = annotationBeginningPositionTop;
        }
      }

      setChannelAnnotations(DeepCopyObj(channelAnnotations));
    }, 750),
  ).current;

  const [messageHistory, setMessageHistory, handleSendJsonMessage, lastJsonMessage, readyState, connectionStatus, getWebSocket, websocketID] = useContext(WebsocketContext);
  const [documentViewWebsocketConnectionStatus, setDocumentViewWebsocketConnectionStatus] = useState(0);

  const [websocketRMID, setWebsocketRMID] = useState();

  const [websocketNotifications, setWebsocketNotifications] = useState({});

  const [websocketViews, setWebsocketViews] = useState({
    withGroupId: {},
    connectionIds: {},
  });

  const docViewWSStatus = {
    0: {
      color: '#dc3545',
      text: 'Not connected'
    },
    1: {
      color: '#0d6efd',
      text: 'Connecting...'
    },
    2: {
      color: '#198754',
      text: 'Connected'
    },
  };

  const [pulseWebsocketButton, setPulseWebsocketButton] = useState();

  const [largeFontSize, setLargeFontSize] = useState();
  const [groupNameMapping, setGroupNameMapping] = useState();
  const [documentTextLoading, setDocumentTextLoading] = useState(true);
  const [documentLoading, setDocumentLoading] = useState(true);
  const [showGroupFilteringModal, setShowGroupFilteringModal] = useState(true);
  const [defaultGroupFilteringId, setDefaultGroupFilteringId] = useState();
  const [foundDefaultGroupFilteringId, setFoundDefaultGroupFilteringId] = useState();

  const [showWebsocketContainer, setShowWebsocketContainer] = useState();
  
  const [
    initializedDocumentScrollEventListener,
    setInitializedDocumentScrollEventListener,
  ] = useState(false);
  const [initializedXScollPosition, setInitializedXScollPosition] = useState(false);
  const [alerts, setAlerts] = useState(initAlerts || []);
  const [documentHighlightedAndLoaded, setDocumentHighlightedAndLoaded] = useState(false);
  const [annotationIdBeingEdited, setAnnotationIdBeingEdited] = useState();
  const [showUnsavedChangesToast, setShowUnsavedChangesToast] = useState();
  const [showMaxTextLengthReached, setShowMaxTextLengthReached] = useState();
  const [documentZoom, setDocumentZoom] = useState(100);
  const [activeAnnotations, setActiveAnnotations] = useState({ annotations: [], target: null });
  const [channelAnnotations, setChannelAnnotations] = useState({ left: null, right: null });
  const [expandedAnnotations, setExpandedAnnotations] = useState([]);
  const [documentFilters, setDocumentFilters] = useState({
    filterOnInit: true,
    annotationsLoaded: false,
    annotationIds: { left: null, right: null },
    filters: {
      byGroup: [],
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
  // popovers for mobile
  const isMobile = false; // placeholder for when we have a mobile version of site
  // eslint-disable-next-line no-unused-vars
  const [displayAnnotationsInChannels, setDisplayAnnotationsInChannels] = useState(!isMobile);
  const [
    annotationIdToScrollTo,
    setAnnotationIdToScrollTo,
  ] = useState(validQuery ? query.aid : undefined);

  const [showMoreInfoShareModal, setShowMoreInfoShareModal] = useState();
  const [showCannotAnnotateDocumentToast, setShowCannotAnnotateDocumentToast] = useState(false);
  const [showMaxedAnnotationLengthToast, setShowMaxedAnnotationLengthToast] = useState();

  const { data: session, status } = useSession();
  const loading = status === 'loading';
  // interesection between user's groups and groups the document is shared to
  const [groupIntersection, setGroupIntersection] = useState();
  // other users this user can share annotations with, generated from groupIntersection
  const [membersIntersection, setMembersIntersection] = useState([]);

  const [extraWidth, setExtraWidth] = useState(0);
  const extraMarginGrowthFactor = 3.5;
  const extraMargin = (documentZoom - 100) * extraMarginGrowthFactor;
  const minDisplayWidth = 0;
  const documentWidth = 750;
  const minChannelWidth = (1400 - documentWidth) / 2;
  const minHeaderHeight = 121;
  const [headerHeight, setHeaderHeight] = useState(minHeaderHeight);
  const [footerHeight, setFooterHeight] = useState(0);
  const footerHeightRef = useRef(0);
  const debounceSetFooterHeight = useRef(
    debounce((setFooterH, footerH, footerHRef) => {
      footerHRef.current = footerH;
      setFooterH(footerH);
    }, 250),
  ).current;


  // state for run text analysis modal
  const [showTextAnalysisModal, setShowTextAnalysisModal] = useState();
  const [textAnalysisData, setTextAnalysisData] = useState();
  const [textAnalysisComplete, setTextAnalysisComplete] = useState();
  const [documentTextAnalysisId, setDocumentTextAnalysisId] = useState(
    (process.env.NEXT_PUBLIC_TEXT_ANALYSIS === 'true' || process.env.NEXT_PUBLIC_TEXT_ANALYSIS === true)
      ? document?.textAnalysisId
      : undefined,
  );
  const [loadingTextAnalysisData, setLoadingTextAnalysisData] = useState();

  const [allAnnotationsHaveBeenExpanded, setAllAnnotationsHaveBeenExpanded] = useState();

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

  const AnnotationMatchesFilters = (
    userEmail, a, filters, userId,
  ) => annotatedByFilterMatch(a.creator.email, filters.annotatedBy)
    && byGroupFilterMatch(a.creator.withGroupId ? [a.creator.withGroupId] : [], filters.byGroup)
    && byTagFilterMatch(a.body.tags, filters.byTags)
    && byPermissionsDocumentViewFilterMatch(
      userEmail,
      a.creator.email,
      a.permissions,
      filters,
      userId,
    );

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
    // we need to make sure that this new annotation is focused if it is being edited
    if (newAnnotation.editing) {
      focusedAnnotationsRef[side] = newAnnotation._id;
    }
    setAnnotationIdBeingEdited(newAnnotation.editing ? newAnnotation._id : undefined);
    const newChannelAnnotations = DeepCopyObj(channelAnnotations);
    newChannelAnnotations[side].splice(indexForNewAnnotation, 0, newAnnotation);
    setChannelAnnotations(newChannelAnnotations);
    setDocumentFilters({ ...documentFilters, filterOnInit: true });
  };

  const deleteAnnotationFromChannels = (side, annotationID) => {
    if (focusedAnnotationsRef[side] === annotationID) {
      focusedAnnotationsRef[side] = null;
    }
    const annotationIndex = channelAnnotations[side]
      .findIndex(
        (annotation) => annotation._id === annotationID,
      );

    setAnnotationIdBeingEdited(); // set it to undefined because there is no annotation being edited
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
    } else {
      return;
    }
    // these constants help control the first line and its depth into the document which then is
    // replaced by a horitzontal line that from their goes to the exact position of the annotation
    const smallestDistanceFromEdgeOfScreen = 27;
    const annotationDistanceFromEdgeOfScreen = $(`#annotation-channel-${side}`).width() - $(`#document-container #${focusID}.annotation-card-container`).width() - smallestDistanceFromEdgeOfScreen;
    const calculateOffsetLeftForLine2 = (anno) => {
      const annoBeingEdited = annotationIdBeingEdited === anno._id;
      let offsetLeftForLine2;
      let line2AdjustmentLeft = 0;
      if (side === 'left') {
        if (annoBeingEdited) {
          line2AdjustmentLeft = -25;
        }
        offsetLeftForLine2 = anno.position.left
        - annotationDistanceFromEdgeOfScreen
        - 10 + line2AdjustmentLeft;
      } else {
        const currentLeftOfAnno = $(`#document-container #${anno._id}`).position().left;
        if (annoBeingEdited) {
          // we know that if this annotation is being edited its left position should be -10.
          // If it is any other value we need to account for this difference in our calculation
          // of offsetLeftForLine2
          line2AdjustmentLeft = currentLeftOfAnno + 10;
        } else {
          // we know that if this annotation is being edited its left position should be 15.
          // If it is any other value we need to account for this difference in our calculation
          // of offsetLeftForLine2
          line2AdjustmentLeft = currentLeftOfAnno - 15;
        }
        offsetLeftForLine2 = anno.position.left - $(`#document-container #${anno._id}`).offset().left - $('#document-container').scrollLeft() + line2AdjustmentLeft;
      }

      return offsetLeftForLine2;
    };
    // first we need to focus the annotation and then place all other
    // annotations after it under it
    const documentZoomTopAdjustment = (documentZoom - 100) * 0.1;
    const documentContainerOffset = $('#document-container').offset();
    let lastHighestPoint = -1000;
    const marginBottom = 8;
    const adjustmentTopNumber = 6;
    let top;
    let trueTop;
    const offsetLeftForLine1 = (side === 'left'
      ? $('#document-card-container').offset().left + 40 - (1.1 * annotationDistanceFromEdgeOfScreen) + $('#document-container').scrollLeft()
      : -70);
    for (let i = focusIndex; i < annos.length; i += 1) {
      if (annos[i] === undefined) { continue; }
      if (documentFilters.annotationIds[side] === null
        || (!documentFilters.annotationIds[side].includes(annos[i]._id) && !annos[i].new)) {
        continue;
      }

      const offsetLeftForLine2 = calculateOffsetLeftForLine2(annos[i]);

      trueTop = annos[i].position.top
        - documentContainerOffset.top
        + documentZoomTopAdjustment
        - adjustmentTopNumber;

      if (lastHighestPoint > trueTop) {
        top = lastHighestPoint + marginBottom;
      } else {
        top = trueTop;
      }

      const annotationCardElement = $(`#document-container #${annos[i]._id}`);
      lastHighestPoint = top + annotationCardElement.height();
      if (i === focusIndex && Math.abs(top - annotationCardElement.position().top) < 1) {
        /*
        const wiggle = 50;
        const duration = 100;
        const lft = annotationCardElement.position().left;
        annotationCardElement.animate({
          left: lft + wiggle,
        }, duration, () => {
          // Animation complete.
          annotationCardElement.animate({
            left: lft - (wiggle * 2),
          }, duration * 5, () => {
            // Animation complete.
            annotationCardElement.animate({
              left: lft,
            }, duration, () => {
              // Animation complete.
              console.log('done');
            });
          });
        });
        */
      } else {
        annotationCardElement.css('top', `${top}px`);
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
    }

    // the next thing we need to do is place all annotations
    // before the focus annotation in its correct position
    // the lowest point an annotation can reach is the
    // current top position of the focused index annotation
    let lastLowestPoint = annos[focusIndex].position.top
      - documentContainerOffset.top
      - adjustmentTopNumber;
    for (let i = focusIndex - 1; i >= 0; i -= 1) {
      if (annos[i] === undefined) { continue; }
      if (documentFilters.annotationIds[side] === null
        || (!documentFilters.annotationIds[side].includes(annos[i]._id) && !annos[i].new)) {
        continue;
      }

      const offsetLeftForLine2 = calculateOffsetLeftForLine2(annos[i]);
      // this is where the annotation wants to be
      trueTop = annos[i].position.top
        - documentContainerOffset.top
        + documentZoomTopAdjustment
        - adjustmentTopNumber;
      // if where you want to be is greater than where you can be then we will set you
      // to where you can be
      // if where you are is greater than where you can be then we have to set your
      // position to where you can be. Otherwise just set your position to where you are
      if (lastLowestPoint - $(`#document-container #${annos[i]._id}`).height() - marginBottom
      < trueTop) {
        top = lastLowestPoint - $(`#document-container #${annos[i]._id}`).height() - marginBottom;
      } else {
        top = trueTop;
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

  const collapseAllAnnotations = () => setExpandedAnnotations([]);
  const expandAllAnnotations = () => {
    setExpandedAnnotations(
      (channelAnnotations.left || []).concat(channelAnnotations.right || []).map(({ _id }) => _id),
    );
    setAllAnnotationsHaveBeenExpanded(true);
  };

  useEffect(() => {
    if (!allAnnotationsHaveBeenExpanded) { return; }
    if (channelAnnotations?.left?.length > 0) {
      moveAnnotationsToCorrectSpotBasedOnFocus('left', channelAnnotations?.left[0]._id);
    }
    if (channelAnnotations?.right?.length > 0) {
      moveAnnotationsToCorrectSpotBasedOnFocus('right', channelAnnotations?.right[0]._id);
    }
  }, [allAnnotationsHaveBeenExpanded]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotationIdToScrollTo, documentFilters]);

  async function getIntersectionOfGroupsAndUsers() {
    // when session loaded, get intersection of groups and the users that applies to
    if (session && document && !groupIntersection) {
      const userGroupIds = session.user.groups.map((g) => g.id);
      const intersection = userGroupIds.filter((id) => document && document.groups.includes(id));
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

  const windowResize = useRef(
    debounce((setDZ) => {
      setDZ((prevDocumentZoom) => prevDocumentZoom + 1);
      setDZ((prevDocumentZoom) => prevDocumentZoom - 1);
    }, 750),
  ).current;

  useEffect(() => {
    getIntersectionOfGroupsAndUsers();
  }, [session]);

  const calculateHeaderAndFooterHeight = (displayFooter, onScroll) => {
    const headerH = $('.as-header').get(0).offsetHeight;
    const footerH = displayFooter ? $('.as-footer').get(0).offsetHeight : 0;
    if (!onScroll) {
      setHeaderHeight(headerH < minHeaderHeight ? minHeaderHeight : headerH);
    }

    debounceSetFooterHeight(setFooterHeight, footerH, footerHeightRef);
  };

  const documentContainerResized = () => {
    windowResize(setDocumentZoom);
    if ($('#document-container').get(0) !== undefined) {
      const {
        scrollHeight, offsetHeight, scrollTop,
      } = $('#document-container').get(0);
      calculateHeaderAndFooterHeight(scrollHeight <= offsetHeight + scrollTop);
    }
    // eslint-disable-next-line no-undef
    setDisplayAnnotationsInChannels(window.innerWidth > minDisplayWidth && !isMobile);
  };

  useEffect(() => {
    if (annotationChannel1Loaded && annotationChannel2Loaded) {
      setDocumentFilters({ ...documentFilters, annotationsLoaded: true });
      // when we load the page for the first time we need to check what the width of the screen
      // is and if it is smaller than the document width then the default value of
      // documentZoom must be adjusted
      // eslint-disable-next-line no-undef
      const ww = window.innerWidth;
      if (ww < documentWidth) {
        const newInitDocumentZoom = 100 - Math.floor(
          ((documentWidth - ww) / (2 * extraMarginGrowthFactor)),
        );
        setDocumentZoom(newInitDocumentZoom);
      } else if ($('#document-container').get(0) !== undefined) {
        const {
          scrollHeight, offsetHeight, scrollTop,
        } = $('#document-container').get(0);
        calculateHeaderAndFooterHeight(scrollHeight <= offsetHeight + scrollTop);
      }
    }
  }, [annotationChannel1Loaded, annotationChannel2Loaded]);

  useEffect(() => {

    if (!annotationChannel1Loaded || !annotationChannel2Loaded || documentLoading) return;

    setShowGroupFilteringModal(true);

    // if all of these are false we can show the group filtering for document modal
  }, [annotationChannel1Loaded, annotationChannel2Loaded, documentLoading])

  const cloudfrontUrl = process.env.NEXT_PUBLIC_SIGNING_URL.split('/url')[0];

  useEffect(async () => {
    if (!document) return

    if (document.groups.length >= 0) {
      const groupNamesRes = await getManyGroupNamesById(document.groups); 
      const grpNameMapping = {
        array: groupNamesRes.groups || [],
        idToName: {
          'personal-group': 'Personal',
        },
        nameToId: {
          'Personal': 'personal-group',
        },
      };

      let defaultGrpFilteringId = undefined;

      grpNameMapping.array.map(({ _id, name }) => {
        grpNameMapping.idToName[_id] = name;
        grpNameMapping.nameToId[name] = _id;

        if (_id === query.gid) {
          defaultGrpFilteringId = _id;
        }

        return null;
      });

      setDefaultGroupFilteringId(defaultGrpFilteringId);
      if (defaultGrpFilteringId) {
        setFoundDefaultGroupFilteringId(true);
      }
      
      setGroupNameMapping(grpNameMapping)
    }
    

    if (document?.text
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
          
          setDocumentTextLoading(false)
        });
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        setDocumentTextLoading(false)
      });
    } else {
      setDocumentTextLoading(false)
    }
  }, [document]);

  useEffect(() => {
    if (lastJsonMessage !== null) {
      // console.log('lastJsonMessage: ', lastJsonMessage);
      if (documentViewWebsocketConnectionStatus < 2) {
        setDocumentViewWebsocketConnectionStatus(2);
      }

      // mangage data coming into the websocket

      const {
        status,
        res: {
          // messages
          $enter_rm,
          $set_rm,
          $notification_rm,
          $disconnect,
          // requests
          $set,
          $get,
        },
      } = lastJsonMessage;

      if ($enter_rm) {
        const { connectionId, data: { user, withGroupId } } = $enter_rm;

        const msg = {
          date: new Date(),
          header: 'new user viewing document',
          description: `${FirstNameLastInitial(user.name)} | ${user.email}`,
        };

        // make sure we have a valid withGroupId and that your not recieving notifications that are coming from yourself
        if (withGroupId && user.websocket_id !== websocketID) {
          if (websocketNotifications[withGroupId]) {
            setWebsocketNotifications((prevState) => ({
              ...prevState,
              [withGroupId]: {
                unread: prevState[withGroupId].unread + 1,
                list: [msg, ...prevState[withGroupId].list],
              }
            }));
          } else {
            setWebsocketNotifications((prevState) => ({
              ...prevState,
              [withGroupId]: {
                unread: 1,
                list: [msg],
              }
            }));
          }
        }

        setPulseWebsocketButton(true);

        const views = DeepCopyObj(websocketViews);

        if (!views.withGroupId[withGroupId]) {
          // if the groupId is not set, set it
          views.withGroupId[withGroupId] = { [connectionId]: true }
        } else if (!views.withGroupId[withGroupId][connectionId]) {
          // if the connectionId in this groupId is not set, set it
          views.withGroupId[withGroupId][connectionId] = true;
        }

        
        views.connectionIds[connectionId] = { ...user, withGroupId };

        setWebsocketViews(views);

      }

      if ($set_rm && $set_rm.connectionId !== $enter_rm?.connectionId) {

        const { connectionId, data: { user, withGroupId } } = $set_rm;

        const views = DeepCopyObj(websocketViews);

        // check if this users withGroupId value has changed before setting the user, could possibly mean the user is switching withGroupId
        if (views.connectionIds[connectionId]?.withGroupId !== withGroupId) {
          // go through each withGroupId and make sure to remove the user from it and add the user to the correct one
          for (const [gid, obj] of Object.entries(views.withGroupId)) {
            if (gid === withGroupId) {
              obj[connectionId] = true;
            } else {
              delete obj[connectionId];
            }
          }
          
        }

        views.connectionIds[connectionId] = {...user,  withGroupId};

        setWebsocketViews(views);

      }

      if ($disconnect) {
        const views = DeepCopyObj(websocketViews);

        $disconnect.map(({ rm, connectionId, data: { user, withGroupId} }) => {

          if (rm === websocketRMID) {

            let foundUser = false;
            
            if (views.withGroupId[withGroupId][connectionId]) {
              delete views.withGroupId[withGroupId][connectionId];
              foundUser = true;
            }

            if (views.connectionIds[connectionId]) {
              delete views.connectionIds[connectionId];
              foundUser = true;
            }

            if (foundUser) {

              const msg = {
                date: new Date(),
                header: 'User has left document',
                description: `${FirstNameLastInitial(user.name)} | ${user.email}`,
              };
      
              // make sure we have a valid withGroupId and that your not recieving notifications that are coming from yourself
              if (withGroupId && user.websocket_id !== websocketID) {
                if (websocketNotifications[withGroupId]) {
                  setWebsocketNotifications((prevState) => ({
                    ...prevState,
                    [withGroupId]: {
                      unread: prevState[withGroupId].unread + 1,
                      list: [msg, ...prevState[withGroupId].list],
                    }
                  }));
                } else {
                  setWebsocketNotifications((prevState) => ({
                    ...prevState,
                    [withGroupId]: {
                      unread: 1,
                      list: [msg],
                    }
                  }));
                }
              }

              setPulseWebsocketButton(true);

            }
          }

          return null;
        });

        // updating websocketViews object
        setWebsocketViews(views);

      }

      if ($notification_rm) {
        const {
          connectionId,
          data,
        } = $notification_rm;

        const {
          annotation,
          new_annotation,
          user,
          withGroupId,
        } = data;

        let description = ''

        if (annotation) {
          description = `${FirstNameLastInitial(annotation.creator.name)} ${new_annotation ? 'made' : 'edited'} an annotation`;
        }

        const msg = {
          date: new Date(),
          connectionId,
          data,
          header: 'new notification',
          description,
        };

        // make sure we have a valid withGroupId and that your not recieving notifications that are coming from yourself
        if (withGroupId && user.websocket_id !== websocketID) {
          if (websocketNotifications[withGroupId]) {
            setWebsocketNotifications((prevState) => ({
              ...prevState,
              [withGroupId]: {
                unread: prevState[withGroupId].unread + 1,
                list: [msg, ...prevState[withGroupId].list],
              }
            }));
          } else {
            setWebsocketNotifications((prevState) => ({
              ...prevState,
              [withGroupId]: {
                unread: 1,
                list: [msg],
              }
            }));
          }
        }

        setPulseWebsocketButton(true);
      }

      if ($get) {
        const { data } = $get;

        const views = DeepCopyObj(websocketViews);

        for (const [connectionId, { user, withGroupId }] of Object.entries(data)) {
          if (!views.withGroupId[withGroupId]) {
            // if the groupId is not set, set it
            views.withGroupId[withGroupId] = { [connectionId]: true }
          } else if (!views.withGroupId[withGroupId][connectionId]) {
            // if the connectionId in this groupId is not set, set it
            views.withGroupId[withGroupId][connectionId] = true;
          }
  
          views.connectionIds[connectionId] = { ...user, withGroupId };

        }

        setWebsocketViews(views);

      }


    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (pulseWebsocketButton) {
      setTimeout(() => setPulseWebsocketButton(), 1500);
    }
  }, [pulseWebsocketButton])

  const handleSwitchWithGroupId = (withGroupId) => {
    const rm = `[doc-view]-${document.slug}`;
    const json = {
      "action": 'request',
      "rm": rm,
      "_set": {
        "user": { "id": `${session.user.id}`, "name": `${session.user.name}`, "email": `${session.user.email}`, "websocket_id": `${websocketID}`, date: new Date(), },
        "withGroupId": `${withGroupId}`,
      },
      "_get": true,
    };
    handleSendJsonMessage(json);
    setDefaultGroupFilteringId(withGroupId)
  };

  useEffect(() => {

    if (foundDefaultGroupFilteringId && defaultGroupFilteringId && readyState === 1 && documentViewWebsocketConnectionStatus === 0) {
      const rm = `[doc-view]-${document.slug}`;
      setDocumentViewWebsocketConnectionStatus(1);

      const websocket_id = RID();
      const json = {
        "action": 'request',
        "rm": rm,
        "_set": {
          "user": { "id": `${session.user.id}`, "name": `${session.user.name}`, "email": `${session.user.email}`, "websocket_id": `${websocket_id}`, date: new Date(), },
          "withGroupId": `${defaultGroupFilteringId}`,
        },
        "_get": true,
      };
      handleSendJsonMessage(json);
      setWebsocketRMID(rm);
    }

  }, [foundDefaultGroupFilteringId, connectionStatus, document, documentViewWebsocketConnectionStatus]);

  useEffect(() => {
    if (!documentTextLoading && groupNameMapping !== undefined) {
      setDocumentLoading(false);
    }
  }, [documentTextLoading, groupNameMapping]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', () => {
      documentContainerResized();
    });

    if (documentTextAnalysisId) {
      setLoadingTextAnalysisData(true);
      getDocumentTextAnalysis({ analysisId: documentTextAnalysisId, returnData: true })
        .then((res) => {
          if (res.err) {
            setAlerts((prevState) => [...prevState, { text: res.err.details, variant: 'danger' }]);
            setDocumentTextAnalysisId();
            setTextAnalysisComplete();
          } else {
          // because returnData = true
            setTextAnalysisData(res.analysis.result);

            setLoadingTextAnalysisData();
            setDocumentTextAnalysisId(res.analysis.id);
            setTextAnalysisComplete(true);
            setShowTextAnalysisModal();
          }
        })
        .catch((err) => {
          setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
          setLoadingTextAnalysisData();
        });
    }
  }, []);

  useEffect(() => {
    if (document.textAnalysisId || documentTextAnalysisId === undefined) {
      return;
    }

    const saveDocumentTextAnalysisId = async () => {
      // this means that document text analysis was just run
      const patchUrl = `/api/document/${document.id}`;
      const body = {
        ...document,
        textAnalysisId: documentTextAnalysisId,
      };

      unfetch(patchUrl, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(() => {})
        .catch((err) => {
          setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        });
    };

    saveDocumentTextAnalysisId();
  }, [documentTextAnalysisId]);

  useEffect(() => {
    debouncedRepositioning(
      channelAnnotations,
      setChannelAnnotations,
    );
    // eslint-disable-next-line no-undef
    const channelWidth = (window.innerWidth - documentWidth - (2 * extraMargin)) / 2;
    setExtraWidth(channelWidth < minChannelWidth ? (minChannelWidth - channelWidth) * 2 : 0);
    if ($('#document-container').get(0) !== undefined) {
      const {
        scrollHeight, offsetHeight, scrollTop,
      } = $('#document-container').get(0);
      calculateHeaderAndFooterHeight(scrollHeight <= offsetHeight + scrollTop);
    }
  }, [documentZoom]);

  useEffect(() => {
    if (!initializedXScollPosition && session && !loading && document && !documentLoading && $('#document-container').get(0) !== undefined) {
      const { scrollWidth, offsetWidth } = $('#document-container').get(0);
      if (scrollWidth > offsetWidth) {
        $('#document-container').scrollLeft((scrollWidth - offsetWidth) / 2);
        setInitializedXScollPosition(true);
      }
    }
  }, [extraWidth]);

  useEffect(() => {
    if (session && !loading && document && !documentLoading && $('#document-container').get(0) !== undefined) {
      const {
        scrollWidth, offsetWidth,
      } = $('#document-container').get(0);
      if (scrollWidth > offsetWidth) {
        $('#document-container').scrollLeft((scrollWidth - offsetWidth) / 2);
      }
      if (!initializedDocumentScrollEventListener) {
        // adding an event listener for when the document container is scrolled so we know
        // when we reach the bottom of the document container scroll bar
        $('#document-container').get(0).addEventListener('scroll', () => {
          const { scrollHeight, offsetHeight, scrollTop } = $('#document-container').get(0);
          // this scalefactor allows for the scroll bar not to be at the very bottom for the footer
          // to persist if it already is showing but if it is not already showing the only way to
          // make it show is to scroll to the very bottom
          const scaleFactor = footerHeightRef.current > 0 ? 1.1 : 1;
          const atTheBottomOfDocument = scrollHeight - scrollTop < (offsetHeight * scaleFactor);
          calculateHeaderAndFooterHeight(atTheBottomOfDocument, true);
        });
        setInitializedDocumentScrollEventListener(true);
      }

      // another thing we must do is set all the links in the document to target="_blank" so that
      // if the user clicks on a link it will open the url in another tab and presever the work
      // they are doing on the document view page
      $('#document-container a').attr('target', '_blank');
    }
  }, [session, loading, document, documentLoading]);

  const cannotAnnotateDocumentToast = (
    <div id="show-cannot-annotate-document-toast-container">
      <Toast
        onClose={() => setShowCannotAnnotateDocumentToast(false)}
        show={showCannotAnnotateDocumentToast}
      >
        <Toast.Header>
          <strong className="mr-auto">Cannot Annotate Document</strong>
        </Toast.Header>
        <Toast.Body>
          <p>
            This document is currently
            {' '}
            {document && document.state === 'draft' && (
            <>
              a
              {' '}
              <PencilFill alt="draft" />
              {' '}
              <strong>Draft</strong>
            </>
            )}
            {document && document.state === 'archived' && (
            <>
              <ArchiveFill alt="archived" />
              {' '}
              <strong>Archived</strong>
            </>
            )}
            . Documents in
            {' '}
            {document && document.state === 'draft' && (
            <>
              <PencilFill alt="draft" />
              {' '}
              <strong>Draft</strong>
            </>
            )}
            {document && document.state === 'archived' && (
            <>
              <ArchiveFill alt="archived" />
              {' '}
              <strong>Archived</strong>
            </>
            )}
            {' '}
            mode cannot be annotated.
          </p>
          <p>
            If you are the document owner, please edit the document and change its state to
            {' '}
            <ChatLeftTextFill />
            {' '}
            <strong>Published</strong>
            {' '}
            to enable annotation.
          </p>
        </Toast.Body>
      </Toast>
    </div>
  );

  if (document === undefined) {
    return <span>Document could not be found</span>;
  }

  const defaultGroupFilteringIdSelected = (annotationChannel1Loaded && annotationChannel2Loaded) ? foundDefaultGroupFilteringId || showGroupFilteringModal === null : false;

  const baseID = 'websocket-container-section';

  // console.log('groupMapping: ', groupNameMapping?.idToName[defaultGroupFilteringId]);

  const sortedWithGroupIdListCount = (groupNameMapping?.array || [])
    .map(({ _id: gid, name }) => [gid, Object.keys(websocketViews.withGroupId[gid] || {}).length, name, gid === defaultGroupFilteringId])
    .sort(([a_gid, a_count, n, a_bool], [b_gid, b_count]) => a_bool ? -1 : b_count - a_count)
  
  // const viewsWithGroupId = Object.keys(websocketViews.withGroupId[defaultGroupFilteringId] || {}).length;
  const totalViews = sortedWithGroupIdListCount.reduce((accumulator, [grpId, count]) => accumulator + count, 0)

  const websocketContainerSections = {
    connection: {
      button: <div id={`${baseID}-connection`}
      style={{
        color: docViewWSStatus[documentViewWebsocketConnectionStatus].color,
        display: 'flex',
        alignItems: 'center'
      }}>
        <BroadcastPin
          style={{ marginRight: 6 }}
          color={docViewWSStatus[documentViewWebsocketConnectionStatus].color}
        />
        {docViewWSStatus[documentViewWebsocketConnectionStatus].text}
      </div>,
      toast: {
        header: <>
          <strong className="me-auto" style={{ color: '#212121' }}>Broadcast status</strong>
          <div style={{ flex: 1 }} />
        </>,
        body: <div style={{ display: 'flex', flexDirection: 'column', padding: '0px 2px' }}>
          <small>Your successfully connected! You'll get notifications and information on what's occuring in this document.</small>
          <div style={{ margin: '8px 0px', height: 1, backgroundColor: 'rgba(0, 0, 0, 0.05)'}} />
        </div>
      },
    },
    notification: {
      button: <div id={`${baseID}-notification`}
        style={{ display: 'flex', alignItems: 'center' }} >
        {documentViewWebsocketConnectionStatus >= 2 ? <Bell /> : <BellSlash />}
        <span style={{ marginLeft: 6 }}>{(defaultGroupFilteringId && websocketNotifications[defaultGroupFilteringId]?.unread) || 0}</span>
      </div>,
      toast: {
        header: <>
          <strong className="me-auto" style={{ color: '#212121' }}>Notifications</strong>
          <div style={{ flex: 1 }} />
          <small
            id="clear-all-label"
            onClick={() => {
              if (defaultGroupFilteringId && websocketNotifications[defaultGroupFilteringId]) {
                // clear the notification unread count for the specific withGroupId
                setWebsocketNotifications((prevState) => ({
                  ...prevState,
                  [defaultGroupFilteringId]: {
                    unread: 0,
                    // list: prevState[defaultGroupFilteringId].list,
                    list: [],
                  }
                }));
              }
            }}
          >Clear all</small>
        </>,
        body: <div style={{ display: 'flex', flexDirection: 'column', padding: '0px 2px' }}>
          <ListGroup as="ol" numbered variant="flush">
            {((defaultGroupFilteringId && websocketNotifications[defaultGroupFilteringId]?.list) || []).map((msg) => <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', width: '100%' }}>
                  <div className="ellipsis" style={{ maxWidth: 150, fontSize: 12, fontWeight: 'bold', color: '#212121', position: 'relative', top: -2 }}>
                    {msg?.header || 'Unknown notification'}
                  </div>
                  <div style={{ flex: 1 }} />
                  {msg?.date && <Badge variant="dark" pill>
                    {moment(msg.date).fromNow()}
                  </Badge>}
                </div>

                <div style={{ fontSize: 12 }}>{msg?.description || '[Error identifying message]'}</div>
                
              </ListGroup.Item>)}
          </ListGroup>
        </div>
      },
    },
    views: {
      button: <div id={`${baseID}-views`}
        style={{ display: 'flex', alignItems: 'center' }}
      >
        {documentViewWebsocketConnectionStatus >= 2 ? <Eye /> : <EyeSlash />}
        <span style={{ marginLeft: 6 }}>{totalViews}</span>
      </div>,
      toast: {
        header: <>
          <div style={{ height: 21, width: 50 }} />
          <DropdownButton
            variant="light"
            id="dropdown-btn-group-view"
            title={<div style={{ display: 'inline-block', minWidth: 265, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="ellipsis" style={{ fontWeight: 'bold', maxWidth: 200 }}>{(sortedWithGroupIdListCount[0] && sortedWithGroupIdListCount[0][2]) || ''}</div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: 13, marginLeft: 5 }}>{`${(sortedWithGroupIdListCount[0] && sortedWithGroupIdListCount[0][1]) || '0'}/${totalViews}`}</div>
              </div>
            </div>}
            size="sm"
            style={{ position: 'absolute' }}
          >
            {sortedWithGroupIdListCount.map(([gid, count, name]) => <Dropdown.Item
              key={`withGroupId-list-count-${gid}`}
              href="#/action-1" style={{ minWidth: 296, fontSize: 12, display: 'flex' }}
              onClick={() => handleSwitchWithGroupId(gid)}
            >
                <div className="ellipsis" style={{ fontWeight: 'bold', maxWidth: 200 }}>{name}</div>
                <div style={{ flex: 1}} />
                <div>{count}</div>
              </Dropdown.Item>
            )}
          </DropdownButton>
        </>,
        body: <div style={{ display: 'flex', flexDirection: 'column', padding: '0px 2px' }}>
          <ListGroup as="ol" numbered variant="flush">
            {Object.entries(websocketViews.withGroupId[defaultGroupFilteringId] || {}).map(([ connectionId ]) => {
              const websocket_id = websocketViews.connectionIds[connectionId]?.websocket_id;
              const me = websocket_id && websocket_id === websocketID;

              return [websocketViews.connectionIds[connectionId]?.date, <ListGroup.Item
                as="li"
                className="d-flex justify-content-between align-items-start"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'start', width: '100%' }}>
                  <div className="ellipsis"
                    style={{
                      maxWidth: 150,
                      fontSize: 14,
                      fontWeight: 'bold',
                      color: me ? '#198754' : '#212121',
                      position: 'relative',
                      top: 0,
                    }}
                  >
                    {FirstNameLastInitial(websocketViews.connectionIds[connectionId]?.name) + (me ? ' (Me)' : '')}
                  </div>
                  <div style={{ flex: 1 }} />
                  {websocketViews.connectionIds[connectionId]?.date && <Badge
                    style={{ position: 'relative', top: 3 }}
                    variant="dark"
                    pill
                  >
                    {moment(websocketViews.connectionIds[connectionId]?.date).fromNow()}
                  </Badge>}
                </div>

                <div style={{ fontSize: 12 }}>{websocketViews.connectionIds[connectionId]?.email || ''}</div>
                
              </ListGroup.Item>];
            }).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, react_comp]) => react_comp)}
          </ListGroup>
        </div>
      },
    },
  };

  const handleClick = (ev) => {
    const ids = [
      `${baseID}-connection`,
      `${baseID}-notification`,
      `${baseID}-views`
    ];
    if (ev.target.id === ids[0] ||  $(ev.target).parents(`#${ids[0]}`).length > 0) {
      setShowWebsocketContainer('connection')
    } else if (ev.target.id === ids[1] || $(ev.target).parents(`#${ids[1]}`).length > 0) {
      setShowWebsocketContainer('notification')
    } else if (ev.target.id === ids[2] || $(ev.target).parents(`#${ids[2]}`).length > 0) {
      setShowWebsocketContainer('views')
    } else {
      setShowWebsocketContainer(!showWebsocketContainer)
    }
    
  };

  const websocketContainer = <div style={{
      zIndex: 5,
      position: 'absolute',
      top: `calc(100vh - ${headerHeight + footerHeight - 70 }px)`,
      right: 20,
    }}>
      <Button
        ref={targetWebsocketContainer}
        className={documentViewWebsocketConnectionStatus >= 2 && pulseWebsocketButton && `pulse-button-2`}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', border: '1px solid #DBE0E5' }}
        size="sm"
        variant="light"
        onClick={handleClick}
      >
        {websocketContainerSections.connection.button}
        <div style={{ width: 1, height: 15, background: 'rgba(219, 224, 229, 0.8)', margin: '0px 10px' }} />
        {websocketContainerSections.notification.button}
        <div style={{ width: 1, height: 15, background: 'rgba(219, 224, 229, 0.8)', margin: '0px 10px' }} />
        {websocketContainerSections.views.button}
      </Button>
      <Overlay
        rootClose
        onHide={handleClick}
        target={targetWebsocketContainer.current}
        transition={false}
        show={showWebsocketContainer}
        placement="top-end"
      >
        <Toast id="websocket-container-toast" show={true} style={{ width: 300, zIndex: 1000, marginBottom: 10 }}>
          <Toast.Header closeButton={false} style={{ position: 'relative' }}>
            {websocketContainerSections[showWebsocketContainer]?.toast.header}
          </Toast.Header>
          <Toast.Body style={{ height: 350, overflowY: 'scroll' }}>
            {websocketContainerSections[showWebsocketContainer]?.toast.body}
          </Toast.Body>
        </Toast>
      </Overlay>
    </div>;

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
            collapseAllAnnotations,
            expandAllAnnotations,
          ]}
        >
          <DocumentFiltersContext.Provider
            value={[documentFilters, setDocumentFilters, FilterAnnotations, groupNameMapping, defaultGroupFilteringId, defaultGroupFilteringIdSelected, document?.version]}
          >
            <Layout
              type="document"
              getTextAnalysisData={() => setShowTextAnalysisModal(true)}
              document={{ ...document, textAnalysisData, loadingTextAnalysisData }}
              alerts={alerts}
              docView
              statefulSession={statefulSession}
              dashboardState={dashboardState}
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
                    onClose={() => setShowUnsavedChangesToast()}
                    scrollToAnnotation={scrollToAnnotation}
                  />
                  <MaxedTextLengthToast
                    show={showMaxTextLengthReached}
                    onClose={() => setShowMaxTextLengthReached()}
                  />
                  <MaxedAnnotationLengthToast
                    show={showMaxedAnnotationLengthToast}
                    onClose={() => setShowMaxedAnnotationLengthToast()}
                  />
                  <HeatMap
                    annotationsLoaded={annotationChannel1Loaded && annotationChannel2Loaded}
                    documentZoom={documentZoom}
                    footerHeight={footerHeight}
                  />
                  {!displayAnnotationsInChannels && <AnnotationsOverlay />}
                  {cannotAnnotateDocumentToast}
                  {websocketContainer}
                  <div id="document-container" className={footerHeight > 0 && 'has-footer'}>
                    <div id="document-inner-container">
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
                        setShowMaxedAnnotationLengthToast={setShowMaxedAnnotationLengthToast}
                        membersIntersection={membersIntersection}
                        alerts={alerts}
                        setAlerts={setAlerts}
                        largeFontSize={largeFontSize}
                        setLargeFontSize={setLargeFontSize}
                      />
                      <div
                        id="document-container-col"
                        style={{
                          transform: `scale(${documentZoom / 100}) translateY(0px)`,
                          transformOrigin: 'top center',
                          minWidth: documentWidth,
                          maxWidth: documentWidth,
                          marginLeft: extraMargin,
                          marginRight: extraMargin,
                        }}
                      >
                        <Document
                          setShowUnsavedChangesToast={setShowUnsavedChangesToast}
                          setShowMaxTextLengthReached={setShowMaxTextLengthReached}
                          annotationIdBeingEdited={annotationIdBeingEdited}
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
                          documentZoom={documentZoom}
                          alerts={alerts}
                          setAlerts={setAlerts}
                          user={session ? session.user : undefined}
                          showCannotAnnotateDocumentToast={showCannotAnnotateDocumentToast}
                          setShowCannotAnnotateDocumentToast={setShowCannotAnnotateDocumentToast}
                          defaultGroupFilteringId={defaultGroupFilteringId}
                        />
                      </div>
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
                        setShowMaxedAnnotationLengthToast={setShowMaxedAnnotationLengthToast}
                        membersIntersection={membersIntersection}
                        alerts={alerts}
                        setAlerts={setAlerts}
                        largeFontSize={largeFontSize}
                        setLargeFontSize={setLargeFontSize}
                      />
                    </div>
                  </div>
                  <Footer />
                  <Modal show={document.version === 4 && !foundDefaultGroupFilteringId && showGroupFilteringModal} onHide={() => {}}>
                    <Modal.Header>
                      <Modal.Title>Opening Document with group</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      {groupNameMapping.array.length > 0 ? groupNameMapping.array.map(({ _id, name }) => <Button
                        style={{ margin: '0px 10px 10px 0px'}}
                        variant={defaultGroupFilteringId === _id ? 'dark' : 'light'}
                        onClick={() => setDefaultGroupFilteringId(_id)}
                      >
                        {name}
                      </Button>) : <Button
                        style={{ margin: '0px 10px 10px 0px'}}
                        variant={defaultGroupFilteringId === 'personal-group' ? 'dark' : 'light'}
                        onClick={() => setDefaultGroupFilteringId('personal-group')}
                      >
                        Personal
                      </Button>}
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="primary"
                        onClick={() => setShowGroupFilteringModal(null)}
                        disabled={defaultGroupFilteringId === undefined}
                      >
                        Continue
                      </Button>
                    </Modal.Footer>
                  </Modal>
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
                  <RunTextAnalysisModal
                    show={showTextAnalysisModal}
                    setShow={setShowTextAnalysisModal}
                    setTextAnalysisData={setTextAnalysisData}
                    textAnalysisComplete={textAnalysisComplete}
                    setTextAnalysisComplete={setTextAnalysisComplete}
                    getHTMLValue={() => document.text}
                    documentTextAnalysisId={documentTextAnalysisId}
                    setDocumentTextAnalysisId={setDocumentTextAnalysisId}
                  />
                </>
              )}
            </Layout>
            <style jsx global>
              {`

              body {
                overflow: hidden !important;
              }

              #annotations-header-label {
                padding: 12px 0px 0px 20px;
              }

              #document-container {
                position: relative;
                height: calc(100vh - ${headerHeight + footerHeight}px);
                transition: height 0.5s;
                overflow-y: overlay !important;
                overflow-x: scroll !important;
                padding: 25px 0px 15px 0px;
                scrollbar-color: rgba(0,0,0,0.1) !important;
              }

              #document-inner-container {
                display: flex;
                flex-direction: row;
                width: calc(100% + ${extraWidth}px);
              }

              #document-container::-webkit-scrollbar-corner {
                background: rgba(0,0,0,0) !important;
              }

              #document-container::-webkit-scrollbar {
                background: rgba(0,0,0,0.05) !important;
                width: 10px !important;
                height: 10px !important;
                border-radius: 8px !important;
              }

              #document-container::-webkit-scrollbar-thumb {
                visibility: visible !important;
                background: rgba(0,0,0,0.1) !important;
                border: 1px solid rgba(0,0,0,0.6) !important;
                border-radius: 8px !important;
              }

              #document-container .annotation-channel-container{
                height: 0px;
                flex: 1;
                position: relative;
                z-index: 2;
                top: -25px;
              }
              
              #document-container #annotation-well-card-container {
                min-height: 100%;
                background-color: transparent;
              }

              #document-container #document-card-container {
                min-height: 971px;
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

              #show-cannot-annotate-document-toast-container {
                z-index: 1;
                position: relative;
                left: 10px;
                top: 10px;
                height: 0px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
              }
    
              #show-cannot-annotate-document-toast-container .toast {
                border-color: rgb(220, 53, 70) !important;
              }
    
              #show-cannot-annotate-document-toast-container .toast-header {
                background-color: rgba(220, 53, 70, 0.85) !important;
                color: white !important; 
              }
    
              #show-cannot-annotate-document-toast-container .toast-header button {
                color: white !important;
              }

              #clear-all-label {  
                cursor: pointer;          
                transition: all 0.5s;
                color: #6c757d;
              }

              #clear-all-label:hover {
                color: #dc3545;
              }

              // 25, 135, 84
              // 219, 224, 229

              .pulse-button-2 {
                display: block;
                border: none;
                // background: rgba(219, 224, 229, 0.8);
                box-shadow: 0 0 0 0 rgba(219, 224, 229, 0.5);
                -webkit-animation: pulse2 1s 1;
              }
              
              @-webkit-keyframes pulse2 {
                0% {
                }
                70% {
                  box-shadow: 0 0 0 25px rgba(219, 224, 229, 0);
                }
                  100% {
                  box-shadow: 0 0 0 0 rgba(219, 224, 229, 0);
                }
              }

              #dropdown-btn-group-view {
                position: relative;
                height: 28px;
                left: -11px;
                width: 296px;
              }

              [aria-labelledby="dropdown-btn-group-view"] {
                max-height: 348px;
                overflow-y: scroll;
              }

              #websocket-container-toast .list-group-item {
                padding: 0.6rem 0.25rem 0.5rem 0.25rem;
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
  let d = {};
  await fetchSharedAnnotationsOnDocument({
    slug, cookie: context.req.headers.cookie, prefetch: true,
  })
    .then((data) => {
      d = data;
      props.annotations = data.annotations;
    }).catch((err) => {
      props = {
        initAlerts: [{ text: err.message, variant: 'danger' }],
      };
    });

  if (props.annotations && d.count > props.annotations.length) {
    const numOfPages = Math.ceil(d.count / MAX_NUMBER_OF_ANNOTATIONS_REQUESTED);
    const unresolved = [];
    for (let i = 1; i < numOfPages; i += 1) {
      unresolved.push(fetchSharedAnnotationsOnDocument({
        slug,
        cookie: context.req.headers.cookie,
        prefetch: true,
        page: i + 1,
        perPage: MAX_NUMBER_OF_ANNOTATIONS_REQUESTED,
      }));
    }

    await Promise.all(unresolved).then((dataArray) => {
      props.annotations = dataArray.reduce(
        (prev, current) => prev.concat(current.annotations),
        props.annotations,
      );
    }).catch((err) => {
      props = {
        initAlerts: [{ text: err.message, variant: 'danger' }],
      };
    });
  }


  return { props };
}

export default DocumentPage;
