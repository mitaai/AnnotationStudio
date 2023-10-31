/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { useEffect, useContext } from 'react';
import $ from 'jquery';
import {
  DocumentContext,
  DocumentAnnotationsContext,
  DocumentFiltersContext,
} from '../../contexts/DocumentContext';
import AnnotationCard from '../AnnotationCard';
import adjustLine from '../../utils/docUIUtils';


function PlaceAnnotationsInCorrectSpot(annotations, side, documentZoom) {
  if (annotations.length === 0) { return; }
  const smallestDistanceFromEdgeOfScreen = 27;
  const annotationDistanceFromEdgeOfScreen = $(`#annotation-channel-${side}`).width() - $(`#document-container #${annotations[0]._id}.annotation-card-container`).width() - smallestDistanceFromEdgeOfScreen;
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
  for (let i = 0; i < annotations.length; i += 1) {
    const offsetLeftForLine2 = side === 'left'
      ? annotations[i].position.left - annotationDistanceFromEdgeOfScreen - 10
      : annotations[i].position.left - $(`#document-container #${annotations[i]._id}`).offset().left - $('#document-container').scrollLeft();
    trueTop = annotations[i].position.top
    - documentContainerOffset.top
    + documentZoomTopAdjustment
    - adjustmentTopNumber;
    if (lastHighestPoint > trueTop) {
      top = lastHighestPoint + marginBottom;
    } else {
      top = trueTop;
    }

    lastHighestPoint = top + $(`#document-container #${annotations[i]._id}`).height();
    $(`#document-container #${annotations[i]._id}`).css('top', `${top}px`);
    // connect annotation to text with line

    // setting line 1
    adjustLine($(`#document-container #${annotations[i]._id} .annotation-pointer-${side}`).get(0), {
      offsetTop: trueTop - top + 13,
      offsetLeft: offsetLeftForLine1,
      offsetWidth: 0,
      offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line1`).get(0));
    // setting line 2 which will have the beginning point of line 1 endpoint
    adjustLine({
      offsetTop: trueTop - top + 13,
      offsetLeft: offsetLeftForLine1,
      offsetWidth: 0,
      offsetHeight: 0,
    }, {
      offsetTop: trueTop - top + 13,
      offsetLeft: offsetLeftForLine2,
      offsetWidth: 0,
      offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line2`).get(0));
  }
}

const AnnotationChannelWithContext = ({
  side,
  setAnnotationChannelLoaded,
  user,
  deleteAnnotationFromChannels,
  focusOnAnnotation,
  focusedAnnotation,
  showMoreInfoShareModal,
  setShowMoreInfoShareModal,
  setShowMaxedAnnotationLengthToast,
  membersIntersection,
  show,
  alerts,
  setAlerts,
  largeFontSize,
  setLargeFontSize,
}) => {

  console.log('membersIntersection: ', membersIntersection)
  const [, documentZoom] = useContext(DocumentContext);
  const [channelAnnotations, , expandedAnnotations] = useContext(DocumentAnnotationsContext);
  const [documentFilters] = useContext(DocumentFiltersContext);
  return (
    <AnnotationChannel
      side={side}
      setAnnotationChannelLoaded={setAnnotationChannelLoaded}
      user={user}
      deleteAnnotationFromChannels={deleteAnnotationFromChannels}
      focusOnAnnotation={focusOnAnnotation}
      focusedAnnotation={focusedAnnotation}
      showMoreInfoShareModal={showMoreInfoShareModal}
      setShowMoreInfoShareModal={setShowMoreInfoShareModal}
      setShowMaxedAnnotationLengthToast={setShowMaxedAnnotationLengthToast}
      membersIntersection={membersIntersection}
      show={show}
      alerts={alerts}
      setAlerts={setAlerts}
      documentZoom={documentZoom}
      channelAnnotations={channelAnnotations}
      expandedAnnotations={expandedAnnotations}
      documentFilters={documentFilters}
      largeFontSize={largeFontSize}
      setLargeFontSize={setLargeFontSize}
    />
  );
};

const AnnotationChannel = ({
  side,
  setAnnotationChannelLoaded,
  user,
  deleteAnnotationFromChannels,
  focusOnAnnotation,
  focusedAnnotation,
  showMoreInfoShareModal,
  setShowMoreInfoShareModal,
  setShowMaxedAnnotationLengthToast,
  membersIntersection,
  show,
  alerts,
  setAlerts,
  documentZoom,
  channelAnnotations,
  expandedAnnotations,
  documentFilters,
  largeFontSize,
  setLargeFontSize,
}) => {
  // first we filter annotations if there are any filters applied
  let sortedAnnotations = channelAnnotations[side] !== null
    ? channelAnnotations[side]
      .filter((anno) => (
        documentFilters.annotationIds[side] !== null
          ? documentFilters.annotationIds[side].includes(anno._id) || anno.new
          : false
      ))
    : [];
  // the first thing we need to is sort these anntotations by their position
  sortedAnnotations = sortedAnnotations.sort((a, b) => {
    // if the tops are the same, which annotation comes first = smaller left value
    if (a.position.top - b.position.top === 0) {
      return a.position.left - b.position.left;
    }
    return a.position.top - b.position.top;
  });

  const focusOrPlaceAnnotations = () => {
    if (show && channelAnnotations[side] !== null) {
      if (focusedAnnotation !== null
        && (
          documentFilters.annotationIds[side] === null
          || documentFilters.annotationIds[side].includes(focusedAnnotation)
        )
      ) {
        focusOnAnnotation(side, focusedAnnotation);
      } else {
        PlaceAnnotationsInCorrectSpot(sortedAnnotations, side, documentZoom);
      }
    }
  };

  useEffect(() => {
    if (channelAnnotations[side] !== null) {
      // this makes sure that the focus of annotation is preserved between rerenders
      focusOrPlaceAnnotations();

      // once everything is placed in the correct spot we need to make sure the correct text has the
      // highlights it needs and remove highlights from text that doesn't need it
      let displayTextHighlighted;
      let anno;
      for (let i = 0; i < channelAnnotations[side].length; i += 1) {
        anno = channelAnnotations[side][i];
        displayTextHighlighted = documentFilters.annotationIds[side] !== null
          ? documentFilters.annotationIds[side].includes(anno._id)
          : false;
        if (displayTextHighlighted) {
          $(`.annotation-highlighted-text[annotation-id='${anno._id}']`).addClass('filtered');
        } else {
          $(`.annotation-highlighted-text[annotation-id='${anno._id}']`).removeClass('filtered');
        }
      }
      // after we have placed everything in the correct spot then the channel is fully loaded
      setAnnotationChannelLoaded(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelAnnotations, documentFilters, largeFontSize]);

  return show && (
  <div className="annotation-channel-container">
    <div id={`annotation-channel-${side}`}>
      <div>
        {sortedAnnotations.map((annotation) => (
          <AnnotationCard
            focusOnAnnotation={() => { focusOnAnnotation(side, annotation._id); }}
            deleteAnnotationFromChannels={deleteAnnotationFromChannels}
            key={annotation._id}
            side={side}
            expanded={expandedAnnotations.includes(annotation._id) || annotation.editing}
            annotation={annotation}
            user={user}
            showMoreInfoShareModal={showMoreInfoShareModal}
            setShowMoreInfoShareModal={setShowMoreInfoShareModal}
            setShowMaxedAnnotationLengthToast={setShowMaxedAnnotationLengthToast}
            membersIntersection={membersIntersection}
            alerts={alerts}
            setAlerts={setAlerts}
            largeFontSize={largeFontSize}
            setLargeFontSize={setLargeFontSize}
          />
        ))}
      </div>
      <style jsx global>
        {`

        `}
      </style>
    </div>
  </div>
  );
};

const AnnotationChannelContainer = (props) => (
  // eslint-disable-next-line react/destructuring-assignment
  props.stateful
    // eslint-disable-next-line react/jsx-props-no-spreading
    ? <AnnotationChannel {...props} />
    // eslint-disable-next-line react/jsx-props-no-spreading
    : <AnnotationChannelWithContext {...props} />
);
export default AnnotationChannelContainer;
