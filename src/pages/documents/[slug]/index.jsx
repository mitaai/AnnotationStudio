/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-continue */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/client';
import $ from 'jquery';
import {
  Modal,
  ProgressBar,
  Toast,
} from 'react-bootstrap';
import {
  ArchiveFill, PencilFill, ChatLeftTextFill,
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
import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import { fetchSharedAnnotationsOnDocument } from '../../../utils/annotationUtil';
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
import adjustLine, { DeepCopyObj } from '../../../utils/docUIUtils';
import Footer from '../../../components/Footer';
import { annotatedByFilterMatch, byDocumentPermissionsFilterMatch, byTagFilterMatch } from '../../../utils/annotationFilteringUtil';


const DocumentPage = ({
  document, annotations, initAlerts, query, statefulSession,
}) => {
  const dashboardState = `${query.did !== undefined && query.slug !== undefined ? `did=${query.did}&slug=${query.slug}&dp=${query.dp}&` : ''}gid=${query.gid}`;
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

  const [documentLoading, setDocumentLoading] = useState(true);
  const [
    initializedDocumentScrollEventListener,
    setInitializedDocumentScrollEventListener,
  ] = useState(false);
  const [initializedXScollPosition, setInitializedXScollPosition] = useState(false);
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

  const [session, loading] = useSession();
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
    && byTagFilterMatch(a.body.tags, filters.byTags)
    && byDocumentPermissionsFilterMatch(userEmail, a.creator.email, a.permissions, filters, userId);

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
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', () => {
      documentContainerResized();
    });
  }, []);

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
            {document.state === 'draft' && (
            <>
              a
              {' '}
              <PencilFill alt="draft" />
              {' '}
              <strong>Draft</strong>
            </>
            )}
            {document.state === 'archived' && (
            <>
              <ArchiveFill alt="archived" />
              {' '}
              <strong>Archived</strong>
            </>
            )}
            . Documents in
            {' '}
            {document.state === 'draft' && (
            <>
              <PencilFill alt="draft" />
              {' '}
              <strong>Draft</strong>
            </>
            )}
            {document.state === 'archived' && (
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
                    onClose={() => { setShowUnsavedChangesToast(); }}
                    scrollToAnnotation={scrollToAnnotation}
                  />
                  <HeatMap
                    annotationsLoaded={annotationChannel1Loaded && annotationChannel2Loaded}
                    documentZoom={documentZoom}
                    footerHeight={footerHeight}
                  />
                  {!displayAnnotationsInChannels && <AnnotationsOverlay />}
                  {cannotAnnotateDocumentToast}
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
                        membersIntersection={membersIntersection}
                        alerts={alerts}
                        setAlerts={setAlerts}
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
                        membersIntersection={membersIntersection}
                        alerts={alerts}
                        setAlerts={setAlerts}
                      />
                    </div>
                  </div>
                  <Footer />
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

              body {
                overflow: hidden !important;
              }

              #annotations-header-label {
                padding: 12px 0px 0px 20px;
              }

              #document-container {
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
  await fetchSharedAnnotationsOnDocument({
    slug, cookie: context.req.headers.cookie, prefetch: true,
  })
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
