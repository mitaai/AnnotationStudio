/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import { useEffect, useContext } from 'react';
import $ from 'jquery';
import {
  Col,
} from 'react-bootstrap';
import {
  DocumentAnnotationsContext,
  DocumentFiltersContext,
} from '../../contexts/DocumentContext';
import AnnotationCard from '../AnnotationCard';

function adjustLine(from, to, line) {
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

  if ((fT < tT && fL < tL)
  || (tT < fT && tL < fL)
  || (fT > tT && fL > tL)
  || (tT > fT && tL > fL)) {
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
}

function PlaceAnnotationsInCorrectSpot(annotations, side) {
  const tempTopAdjustment = 0;
  const documentContainerOffset = $('#document-container').offset();
  let lastHighestPoint = -1000;
  const marginBottom = 8;
  const adjustmentTopNumber = 6;
  let top;
  let trueTop;
  const offsetLeftForLine1 = side === 'left' ? $('#document-card-container').offset().left + 25 : -40;
  for (let i = 0; i < annotations.length; i += 1) {
    const offsetLeftForLine2 = side === 'left' ? annotations[i].position.left : annotations[i].position.left - $(`#document-container #${annotations[i]._id}`).offset().left;
    trueTop = annotations[i].position.top
    - documentContainerOffset.top
    + tempTopAdjustment
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

const AnnotationChannel = ({
  side,
  setAnnotationChannelLoaded,
  user,
  deleteAnnotationFromChannels,
  focusOnAnnotation,
  showMoreInfoShareModal,
  setShowMoreInfoShareModal,
  membersIntersection,
  show,
  alerts,
  setAlerts,
}) => {
  const [channelAnnotations] = useContext(DocumentAnnotationsContext);
  const [documentFilters] = useContext(DocumentFiltersContext);
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

  useEffect(() => {
    if (channelAnnotations[side] !== null) {
      if (show) {
        PlaceAnnotationsInCorrectSpot(sortedAnnotations, side);
      }

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
  });

  return show && (
  <Col className="annotation-channel-container">
    <div id={`annotation-channel-${side}`}>
      <div>
        {sortedAnnotations.map((annotation) => (
          <AnnotationCard
            focusOnAnnotation={() => { focusOnAnnotation(side, annotation._id); }}
            deleteAnnotationFromChannels={deleteAnnotationFromChannels}
            key={annotation._id}
            side={side}
            expanded={false}
            annotation={annotation}
            user={user}
            showMoreInfoShareModal={showMoreInfoShareModal}
            setShowMoreInfoShareModal={setShowMoreInfoShareModal}
            membersIntersection={membersIntersection}
            alerts={alerts}
            setAlerts={setAlerts}
          />
        ))}
      </div>
      <style jsx global>
        {`

        `}
      </style>
    </div>
  </Col>
  );
};

export default AnnotationChannel;
