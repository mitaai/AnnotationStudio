import React from 'react';
import $ from 'jquery';
import {
  Pen,
} from 'react-bootstrap-icons';

import { RID } from '../../utils/docUIUtils';

export default function AnnotateButton({
  annotationIdBeingEdited,
  annotateDocument,
  selector,
  setShowUnsavedChangesToast,
  setShowMaxTextLengthReached,
  addNewAnnotationToDom,
  setShowCannotAnnotateDocumentToast,
  documentToAnnotate,
  position,
  setPosition,
}) {
  const maxTextLength = 1500;
  const topAdjustment = 40;
  const leftAdjustment = 16;
  let top = 0;
  let left = 0;
  const show = $('#document-card-container').get(0) !== undefined && position !== undefined;
  if (show) {
    top = (position.buttonY / position.dz) - topAdjustment;
    left = (position.buttonX / position.dz) - leftAdjustment;
  }


  return (
    <>
      <div
        id="annotate-document-button-container"
        role="button"
        tabIndex={0}
        onMouseDown={async () => {
          if (annotationIdBeingEdited !== undefined) {
            setShowUnsavedChangesToast(true);
          } else if (selector.exact.length > maxTextLength) {
            setShowMaxTextLengthReached(true);
          } else if (!['draft', 'archived'].includes(documentToAnnotate.state) && position !== undefined) {
            const rid = RID();
            await annotateDocument(selector, rid);

            // when the user clicks to annotate the piece of text that is selected
            // we need to grab information about all the annotations currently
            // showing in the dom then we need to place this new annotation into
            // that object along with the annotations position data then once we
            // have set this new information we need to save it by reseting the
            // dom element attribute "annotations" then use the new data and use
            // the updated data and pass it into
            // moveAnnotationsToCorrectSpotBasedOnFocus
            const currentScrollValue = $('#document-container').scrollTop();
            const scrollTo = currentScrollValue + position.startY - $('#document-container').offset().top - 40;
            $('#document-container').animate({
              scrollTop: scrollTo < 0 ? 0 : scrollTo,
            }, 500, () => {
              addNewAnnotationToDom(rid);
              // after text is annotated hide annotate button
              setPosition();
            });
          } else {
            setShowCannotAnnotateDocumentToast(true);
          }
        }}
      >
        <div id="annotate-document-button-inner-container">
          <Pen style={{ position: 'relative', top: 2 }} />
        </div>
        <div id="annotate-button-arrow-down" />
      </div>
      <style jsx global>
        {`
          #annotate-document-button-container {
              display: ${show ? 'inline' : 'none'};
              position: absolute;
              left: ${left}px;
              top: ${top}px;
              cursor: pointer;
              z-index: 10;
          }

          #annotate-document-button-container:focus {
            outline: 0;
          }

          #annotate-document-button-inner-container {
            width: 32px;
            height: 32px;
            color: white;
            text-align: center;
            background-color: black;
            border-radius: 5px;
          }

          #annotate-button-arrow-down {
            position: relative;
            left: 6px;
            top: -3px;
            width: 0; 
            height: 0; 
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid black;
            border-radius: 5px;
          }
      `}
      </style>
    </>
  );
}
