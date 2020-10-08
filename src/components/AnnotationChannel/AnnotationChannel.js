import { useEffect, useState } from 'react';

import $ from 'jquery';

import {
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
} from 'react-bootstrap';

import AnnotationCard from '../AnnotationCard';

function adjustLine(from, to, line) {
  const fT = from.offsetTop + from.offsetHeight / 2;
  const tT = to.offsetTop 	 + to.offsetHeight / 2;
  const fL = from.offsetLeft + from.offsetWidth / 2;
  const tL = to.offsetLeft 	 + to.offsetWidth / 2;

  const CA = Math.abs(tT - fT);
  const CO = Math.abs(tL - fL);
  const H = Math.sqrt(CA * CA + CO * CO);
  let ANG = 180 / Math.PI * Math.acos(CA / H);

  if (tT > fT) {
    var top = (tT - fT) / 2 + fT;
  } else {
    var top = (fT - tT) / 2 + tT;
  }
  if (tL > fL) {
    var left = (tL - fL) / 2 + fL;
  } else {
    var left = (fL - tL) / 2 + tL;
  }

  if ((fT < tT && fL < tL) || (tT < fT && tL < fL) || (fT > tT && fL > tL) || (tT > fT && tL > fL)) {
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

function MoveAnnotationsToCorrectSpotBasedOnFocus(side, focusID) {
  const annotations = JSON.parse($('#document-container').attr('annotations'))[side];
  // this function will focus the annotation that has been clicked on in the channel. It works very similar to the function "PlaceAnnotationsInCorrectSpot"

  // first we need to find the index of the annotation we want to focus on in the annotations array
  const focusIndex = annotations.findIndex((annotation) => annotation._id === focusID);


  // first we need to focus the annotation and then place all other annotations after it under it
  const tempTopAdjustment = 0;
  const documentContainerOffset = $('#document-container').offset();
  let lastHighestPoint = -1000;
  const marginBottom = 5;
  const adjustmentTopNumber = 6;
  let top;
  let trueTop;
  const offsetLeftForLine1 = side === 'left' ? $('#document-card-container').offset().left + 25 : -40;
  for (let i = focusIndex; i < annotations.length; i += 1) {
    const offsetLeftForLine2 = side === 'left' ? annotations[i].position.left : annotations[i].position.left - $(`#document-container #${annotations[i]._id}`).offset().left;
    trueTop = annotations[i].position.top - documentContainerOffset.top + tempTopAdjustment - adjustmentTopNumber;
    if (lastHighestPoint > trueTop) {
      top = lastHighestPoint + marginBottom;
    } else {
      top = trueTop;
    }

    lastHighestPoint = top + $(`#document-container #${annotations[i]._id}`).height();
    $(`#document-container #${annotations[i]._id}`).css('top', `${top}px`);
    // now that we have placed the annotation in its correct spot we need to set the line that visually connects the annotation to the text

    // setting line 1
    adjustLine($(`#document-container #${annotations[i]._id} .annotation-pointer-${side}`).get(0), {
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine1, offsetWidth: 0, offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line1`).get(0));
    // setting line 2 which will have the beginning point of line 1 endpoint
    adjustLine({
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine1, offsetWidth: 0, offsetHeight: 0,
    }, {
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine2, offsetWidth: 0, offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line2`).get(0));
  }

  // the next thing we need to do is place all annotations before the focus annotation in its correct position
  // the lowest point an annotation can reach is the current top position of the focused index annotation
  let lastLowestPoint = annotations[focusIndex].position.top - documentContainerOffset.top + tempTopAdjustment - adjustmentTopNumber;
  for (let i = focusIndex - 1; i >= 0; i -= 1) {
    const offsetLeftForLine2 = side === 'left' ? annotations[i].position.left : annotations[i].position.left - $(`#document-container #${annotations[i]._id}`).offset().left;
    // this is where the annotation wants to be
    trueTop = annotations[i].position.top - documentContainerOffset.top + tempTopAdjustment - adjustmentTopNumber;
    // if where the annotation can be minus the annotation height is smaller than were it wants to be then we have to set the annotations top to where it can be and not where it wants to be. Or if where it is now is no an acceptable value we will move it to the next most available spot
    if (lastLowestPoint - $(`#document-container #${annotations[i]._id}`).height() - marginBottom < trueTop || lastLowestPoint - $(`#document-container #${annotations[i]._id}`).height() - marginBottom < $(`#document-container #${annotations[i]._id}`).position().top) {
      top = lastLowestPoint - $(`#document-container #${annotations[i]._id}`).height() - marginBottom;
    } else {
      // this would be focusing the annotation if it is possible which could displace other annotations higher up because we are iterating through the loop backwards
      top = trueTop;
    }

    lastLowestPoint = top;
    $(`#document-container #${annotations[i]._id}`).css('top', `${top}px`);
    // now that we have placed the annotation in its correct spot we need to set the line that visually connects the annotation to the text

    // setting line 1
    adjustLine($(`#document-container #${annotations[i]._id} .annotation-pointer-${side}`).get(0), {
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine1, offsetWidth: 0, offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line1`).get(0));
    // setting line 2 which will have the beginning point of line 1 endpoint
    adjustLine({
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine1, offsetWidth: 0, offsetHeight: 0,
    }, {
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine2, offsetWidth: 0, offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line2`).get(0));
  }
}

function PlaceAnnotationsInCorrectSpot(annotations, side) {
  const tempTopAdjustment = 0;
  const documentContainerOffset = $('#document-container').offset();
  let lastHighestPoint = -1000;
  const marginBottom = 5;
  const adjustmentTopNumber = 6;
  let top;
  let trueTop;
  const offsetLeftForLine1 = side === 'left' ? $('#document-card-container').offset().left + 25 : -40;
  for (let i = 0; i < annotations.length; i += 1) {
    const offsetLeftForLine2 = side === 'left' ? annotations[i].position.left : annotations[i].position.left - $(`#document-container #${annotations[i]._id}`).offset().left;
    trueTop = annotations[i].position.top - documentContainerOffset.top + tempTopAdjustment - adjustmentTopNumber;
    if (lastHighestPoint > trueTop) {
      top = lastHighestPoint + marginBottom;
    } else {
      top = trueTop;
    }

    lastHighestPoint = top + $(`#document-container #${annotations[i]._id}`).height();
    $(`#document-container #${annotations[i]._id}`).css('top', `${top}px`);
    // now that we have placed the annotation in its correct spot we need to set the line that visually connects the annotation to the text

    // setting line 1
    adjustLine($(`#document-container #${annotations[i]._id} .annotation-pointer-${side}`).get(0), {
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine1, offsetWidth: 0, offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line1`).get(0));
    // setting line 2 which will have the beginning point of line 1 endpoint
    adjustLine({
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine1, offsetWidth: 0, offsetHeight: 0,
    }, {
      offsetTop: trueTop - top + 13, offsetLeft: offsetLeftForLine2, offsetWidth: 0, offsetHeight: 0,
    }, $(`#document-container #${annotations[i]._id} .line2`).get(0));
  }
}

function AnnotationChannel({ side, annotations, setAnnotationChannelLoaded }) {
  let sortedAnnotations = [];
  if (annotations !== null) {
    // the first thing we need to is sort these anntotations by their position
    sortedAnnotations = annotations.sort((a, b) => {
      if (a.position.top - b.position.top === 0) { // if the tops are the same then we have to distinguish which annotation comes first by who has the smaller left value
        return a.position.left - b.position.left;
      }
      return a.position.top - b.position.top;
    });
  }

  useEffect(() => {
    if (annotations !== null) {
      // after the channel renders we need to take these annotations and place them in their correct spot
      PlaceAnnotationsInCorrectSpot(sortedAnnotations, side);
      // after we have placed everything in the correct spot then the channel is fully loaded
      setTimeout(setAnnotationChannelLoaded, 500, true);
    }
  });

  return (
    <div id={`annotation-channel-${side}`}>
      <div id={`new-annotation-holder-${side}`} />
      <div>
        {sortedAnnotations.map((annotation) => (
          <AnnotationCard focusOnAnnotation={() => { MoveAnnotationsToCorrectSpotBasedOnFocus(side, annotation._id); }} key={annotation._id} side={side} expanded={false} annotation={annotation} />
        ))}
      </div>
      <style jsx global>
        {`
          
        `}
      </style>
    </div>
  );
}

export default AnnotationChannel;
