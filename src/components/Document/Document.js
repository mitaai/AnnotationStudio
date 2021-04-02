/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-danger */
/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect, useRef } from 'react';
import $ from 'jquery';
import {
  Overlay, Tooltip, Toast, Card,
} from 'react-bootstrap';
import {
  ArchiveFill, Pen, PencilFill, ChatLeftTextFill,
} from 'react-bootstrap-icons';
import {
  createTextQuoteSelector,
  highlightRange,
} from 'apache-annotator/dom';
import { debounce, RID } from '../../utils/docUIUtils';

const highlightText = async (obj, domElement) => {
  const s = createTextQuoteSelector(obj.selector);
  const matches = s(domElement);
  for await (const range of matches) {
    // calls matches.next() -> Promise -> resolves -> returns -> {value: '', done: boolean}
    highlightRange(range, 'span', { ...obj.props });
  }
};


const onlyOneMatchForSelector = async (domElement, selectorObj) => {
  // this takes an selector object with keys exact, prefix,
  // and suffix and returns true if there is only one match otherwise false
  let count = 0;
  const s = createTextQuoteSelector(selectorObj);
  const matches = s(domElement);
  for await (const range of matches) { // eslint-disable-line no-unused-vars
    if (count === 0) { // if we haven't found a match yet then we need to record this match
      count += 1;
    } else return false;
    // if we have already found a match then we need to
    // return false immediately to say that there is more than one match
  }
  return true;
};

const customDescibeTextQuote = async (range, scope) => {
  // eslint-disable-next-line no-undef
  const RangePrefix = document.createRange();
  RangePrefix.setStart(scope.startContainer, scope.startOffset);
  RangePrefix.setEnd(range.startContainer, range.startOffset);
  // eslint-disable-next-line no-undef
  const RangeSuffix = document.createRange();
  RangeSuffix.setStart(range.endContainer, range.endOffset);
  RangeSuffix.setEnd(scope.endContainer, scope.endOffset);
  const fullTextSelector = {
    // this holds the whole document in the form of a prefix,
    // the text we want to select, and then everything after that.
    exact: range.toString(),
    prefix: RangePrefix.toString(),
    suffix: RangeSuffix.toString(),
  };

  let textSelectorIsUnique = false;
  const maxCharacterLength = Math.max(
    fullTextSelector.prefix.length,
    fullTextSelector.suffix.length,
  );
  for (let numOfCharacters = 20; numOfCharacters < maxCharacterLength; numOfCharacters += 15) {
    // eslint-disable-next-line no-await-in-loop
    textSelectorIsUnique = await onlyOneMatchForSelector($('#document-content-container').get(0), {
      exact: fullTextSelector.exact,
      prefix: fullTextSelector.prefix.slice(-1 * numOfCharacters),
      suffix: fullTextSelector.suffix.slice(0, numOfCharacters),
    });
    if (textSelectorIsUnique) {
      return {
        exact: fullTextSelector.exact,
        prefix: fullTextSelector.prefix.slice(-1 * numOfCharacters),
        suffix: fullTextSelector.suffix.slice(0, numOfCharacters),
      };
    }
  }

  // if we couldn't find a unique match just return the full selector
  return fullTextSelector;
};


export default function Document({
  setShowUnsavedChangesToast,
  annotationIdBeingEdited,
  annotations,
  setChannelAnnotations,
  addActiveAnnotation,
  removeActiveAnnotation,
  user,
  addAnnotationToChannels,
  documentToAnnotate,
  documentZoom,
  annotateDocument,
  displayAnnotationsInChannels,
  setAlerts,
}) {
  const myRef = useRef();
  const [target, setTarget] = useState(null);
  const [show, setShow] = useState();
  const [selector, setSelector] = useState(null);
  const [selectedTextToAnnotate, setSelectedTextToAnnotate] = useState();
  const [showCannotAnnotateDocumentToast, setShowCannotAnnotateDocumentToast] = useState(false);
  const [annotationsHighlighted, setAnnotationsHighlighted] = useState();

  const activateAnnotation = (e) => {
    const annoId = $(e.target).attr('annotation-id');
    // highlighting all every piece of the annotation a different color by setting it to active
    if (!$(`.annotation-highlighted-text[annotation-id='${annoId}']`).hasClass('active')) {
      $(`.annotation-highlighted-text[annotation-id='${annoId}']`).addClass('active');
    }

    addActiveAnnotation(annoId, $(e.target).get(0));
  };

  const addHoverEventListenersToAllHighlightedText = () => {
    $('.annotation-highlighted-text').on('mouseover', activateAnnotation).on('mouseout', (e) => {
      const annoId = $(e.target).attr('annotation-id');
      if (!$(`#${annoId}`).hasClass('expanded')) {
        $(`.annotation-highlighted-text[annotation-id='${annoId}']`).removeClass('active');
      }
      removeActiveAnnotation(annoId);
    }).on('click', (e) => {
      const aid = $(e.target).attr('annotation-id');
      if ($(e.target).hasClass('active')) {
        $(`#${aid} .annotation-header`).trigger('click');
      }
      // if the display mode is for mobile then when the user clicks on an annotation
      // it should add the annotation to the activeAnnotations state
      if (!displayAnnotationsInChannels) {
        addActiveAnnotation(aid, $(e.target).get(0));
      }
    });
  };

  const highlightTextForAllAnnotations = async (_annotations) => {
    const annotationsLeftRight = {
      left: [],
      right: [],
    };
    for await (const annotation of _annotations) {
      await highlightText({
        selector: annotation.target.selector,
        props:
        {
          'annotation-id': annotation._id,
          class: 'annotation-highlighted-text',
        },
      }, $('#document-content-container').get(0));

      // after we highlight everything in the document we need to figure out
      // the position of where these highlights are and divide the array of
      // annotations we were given into two array representing left and right
      // side channel and then add position data to the annotation object.
      $($(`#document-content-container span[annotation-id='${annotation._id}']`).get(0))
        .prepend("<span class='annotation-beginning-marker'></span>");
      $($(`#document-content-container span[annotation-id='${annotation._id}']`).get(-1))
        .append("<span class='annotation-ending-marker'></span>");
      // so now that we have added the beginning marker we are going to get
      // the position of the begginning marker then remove it from the dom
      const annotationBeginning = $(`#document-content-container span[annotation-id='${annotation._id}'] .annotation-beginning-marker`);
      const annotationEnding = $(`#document-content-container span[annotation-id='${annotation._id}'] .annotation-ending-marker`);
      if (annotationBeginning.get(0) === undefined) {
        setAlerts((prevState) => [...prevState, {
          text: `Highlight error for annotation with ID ${annotation._id}`, variant: 'warning',
        }]);
      } else {
        const annotationBeginningPosition = annotationBeginning.offset();
        const annotationEndingPosition = annotationEnding.offset();
        // this takes into account if the user was scrolling through the document
        // as the it was being populated with annotations
        annotationBeginningPosition.top += $('#document-container').scrollTop();
        annotationEndingPosition.top += $('#document-container').scrollTop();
        // now that we have position data we will add the annotation
        // ither to the left or right channel
        // eslint-disable-next-line no-undef
        if (annotationBeginningPosition.left < window.innerWidth / 2) {
          annotationsLeftRight.left.push(
            {
              position:
              {
                left: annotationBeginningPosition.left,
                top: annotationBeginningPosition.top,
                height: (annotationEndingPosition.top - annotationBeginningPosition.top) + 18,
              },
              ...annotation,
            },
          );
        } else {
          annotationsLeftRight.right.push(
            {
              position:
              {
                left: annotationBeginningPosition.left,
                top: annotationBeginningPosition.top,
                height: (annotationEndingPosition.top - annotationBeginningPosition.top) + 18,
              },
              ...annotation,
            },
          );
        }
      }
    }

    // now that we have organized the annotations by left and right we
    // need them to be displayed in the their correct channels
    // before we set the channel annotations we are going to save
    // this data in the dom to be retrieved later by other components
    annotationsLeftRight.left = annotationsLeftRight.left.sort((a, b) => {
      // if the tops are the same then we have to distinguish which
      // annotation comes first by who has the smaller left value
      if (a.position.top - b.position.top === 0) {
        return a.position.left - b.position.left;
      }
      return a.position.top - b.position.top;
    });
    annotationsLeftRight.right = annotationsLeftRight.right.sort((a, b) => {
      // if the tops are the same then we have to distinguish which
      // annotation comes first by who has the smaller left value
      if (a.position.top - b.position.top === 0) {
        return a.position.left - b.position.left;
      }
      return a.position.top - b.position.top;
    });

    setChannelAnnotations(annotationsLeftRight);
    addHoverEventListenersToAllHighlightedText();
  };

  const positionAnnotateButton = (selection, mySelector) => {
    // we need to remove the existing marker for the annotate btn position before we put another
    if ($('#annotate-btn-position-node').get(0) != null) {
      $('#annotate-btn-position-node').remove();
    }

    if ($('#annotate-start-position-span').get(0) != null) {
      $('#annotate-start-position-span').remove();
    }

    // eslint-disable-next-line no-undef
    const range = document.createRange();
    // eslint-disable-next-line no-undef
    const newNode = document.createElement('span');
    newNode.setAttribute('id', 'annotate-btn-position-node');
    range.setStart(selection.focusNode, selection.focusOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    range.insertNode(newNode);
    // now that the node is inserted we can get its position so
    // that we can place the annotate button in the right place
    // eslint-disable-next-line no-undef
    const element = document.getElementById('annotate-btn-position-node');
    // now we need to add an element to indicate where the annotation starts
    const selectionRange = selection.getRangeAt(0);
    // eslint-disable-next-line no-undef
    const annotationStartSpan = document.createElement('span');
    annotationStartSpan.setAttribute('id', 'annotate-start-position-span');
    range.setStart(selectionRange.startContainer, selectionRange.startOffset);
    range.setEnd(selectionRange.endContainer, selectionRange.endOffset);
    range.insertNode(annotationStartSpan);

    setTarget(element);
    setShow(true);
    setSelector(mySelector);
  };

  const addNewAnnotationToDom = (rid) => {
    $($(`#document-content-container span[annotation-id='${rid}']`).get(0))
      .prepend("<span class='annotation-beginning-marker'></span>");
    $($(`#document-content-container span[annotation-id='${rid}']`).get(-1))
      .append("<span class='annotation-ending-marker'></span>");
    const annotationBeginning = $(`#document-content-container span[annotation-id='${rid}'] .annotation-beginning-marker`);
    const annotationEnding = $(`#document-content-container span[annotation-id='${rid}'] .annotation-ending-marker`);
    const annotationBeginningPosition = annotationBeginning.offset();
    const annotationEndingPosition = annotationEnding.offset();
    annotationBeginningPosition.top += $('#document-container').scrollTop();
    annotationEndingPosition.top += $('#document-container').scrollTop();
    const annotateStartPositionSpan = $('#annotate-start-position-span').offset();
    annotateStartPositionSpan.left += $('#document-container').scrollLeft();
    annotateStartPositionSpan.top += $('#document-container').scrollTop();
    // eslint-disable-next-line no-undef
    const side = (annotateStartPositionSpan.left < window.innerWidth / 2)
      ? 'left'
      : 'right';

    const newAnnotation = {
      _id: rid,
      new: true,
      editing: true,
      type: 'Annotation',
      creator: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      permissions: {
        groups: [],
        sharedTo: undefined,
        private: true,
      },
      created: undefined,
      modified: undefined,
      body: {
        type: 'TextualBody',
        value: '', // (valid HTML)
        tags: [],
        format: 'text/html',
        language: 'en', // W3C Language Tag for English
      },
      target: {
        document: {
          ...documentToAnnotate,
          text: undefined,
          format: 'text/html',
        },
        selector: {
          type: 'TextQuoteSelector',
          ...selector, // keys -> exact, prefix, suffix
        },
      },
      position: {
        left: annotateStartPositionSpan.left,
        top: annotationBeginningPosition.top,
        height: (annotationEndingPosition.top - annotationBeginningPosition.top) + 18,
      },
    };

    addAnnotationToChannels(side, newAnnotation);
    setSelectedTextToAnnotate(side);
  };

  useEffect(() => {
    if (selectedTextToAnnotate === undefined) { return; }
    const { scrollWidth } = $('#document-container').get(0);
    $('#document-container').animate({
      scrollLeft: selectedTextToAnnotate === 'left' ? '0px' : `${10 + scrollWidth - $('#document-container').width()}px`,
    }, 750);
  }, [selectedTextToAnnotate]);

  useEffect(() => {
    if (documentToAnnotate && documentToAnnotate.text) {
      const bgImages = $('img.bi');
      bgImages.map((_index, bgImage) => bgImage.setAttribute('draggable', false));
    }
  }, [documentToAnnotate]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    if (!annotationsHighlighted) {
      document.addEventListener('selectionchange', () => { // eslint-disable-line no-undef
        const selection = document.getSelection(); // eslint-disable-line no-undef
        if (selection.rangeCount === 1) {
          const range = selection.getRangeAt(0);
          if (range.collapsed) {
            // we need to wait 500ms because clicking the annotate button can
            // trigger this event so we want the annotate button to be clicked
            // before removing it from the dom
            setTimeout(() => {
              setTarget(null);
              setShow();
            }, 500);
          }
        }
      });
      document.addEventListener('selectionchange', debounce(async (documentContainer) => { // eslint-disable-line no-undef
        // we need to make sure that the annotate button disappears
        // while the document selection is being made
        if (target !== null || show) {
          setTarget(null);
          setShow();
        }

        if (!$('#document-content-container').hasClass('unselectable')) {
        // if the reason why the selection change is because you selected text
        // to annotate then don't remove class active from a text that was selected
        // otherwise the selection change so any text that was selected by the user
        // is no longer needed so we need to remove styling
          if (selectedTextToAnnotate === undefined) {
          // if we are making a new selection we need to make sure all old selections are removed
            $('.text-currently-being-annotated').removeClass('active');
            $('#document-content-container').removeClass('unselectable');
          } else {
            setSelectedTextToAnnotate();
          }

          // eslint-disable-next-line no-undef
          const selection = document.getSelection();
          if (selection.rangeCount === 1) {
            const range = selection.getRangeAt(0);
            if (!range.collapsed && range.toString().length > 0) {
            // we need to make sure this selection happened inside the
            // document card container and not some where outside of the document
              if ($(range.commonAncestorContainer.parentElement).parents('#document-card-container').length !== 0) {
              // make sure the range is something
              // eslint-disable-next-line no-undef
                const scope = document.createRange();
                scope.selectNodeContents(documentContainer);
                // we need to make sure that the selection the user made is inside the
                // scope, meaning that everything they selected is inside the document and
                // not outside the document
                const mySelector = await customDescibeTextQuote(range, scope);
                positionAnnotateButton(selection, mySelector);
              }
            }
          }
        }

      //
      }, 500, myRef.current));
      setAnnotationsHighlighted(true);
      setTimeout(highlightTextForAllAnnotations, 100, annotations);
    }
  });

  useEffect(() => {
    // when the document is scrolled it updates the position of the Annotation Pen Tooltip so
    // that it stays in the correct spot as we zoom in and out of the document
    const st = $('#document-container').scrollTop();
    $('#document-container').scrollTop(st + 1);
    $('#document-container').scrollTop(st);
  }, [documentZoom]);

  const documentContentContainer = (
    <Card
      id="document-card-container"
    >
      <Card.Body>
        <div id="document-content-container" ref={myRef}>
          <div dangerouslySetInnerHTML={{ __html: documentToAnnotate ? documentToAnnotate.text : '' }} />
        </div>
      </Card.Body>
    </Card>
  );
  return (
    <>
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
              {documentToAnnotate.state === 'draft' && (
                <>
                  a
                  {' '}
                  <PencilFill alt="draft" />
                  {' '}
                  <strong>Draft</strong>
                </>
              )}
              {documentToAnnotate.state === 'archived' && (
                <>
                  <ArchiveFill alt="archived" />
                  {' '}
                  <strong>Archived</strong>
                </>
              )}
              . Documents in
              {' '}
              {documentToAnnotate.state === 'draft' && (
                <>
                  <PencilFill alt="draft" />
                  {' '}
                  <strong>Draft</strong>
                </>
              )}
              {documentToAnnotate.state === 'archived' && (
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
      {documentContentContainer}
      <Overlay id="annotate-document-overlay" target={target} show={show} placement="top">
        {(props) => (
          <Tooltip
            id="annotate-document-tooltip"
            onMouseDown={async () => {
              if (annotationIdBeingEdited !== undefined) {
                setShowUnsavedChangesToast(true);
              } else if (!['draft', 'archived'].includes(documentToAnnotate.state)) {
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

                // first grabbing position data on the '#annotate-start-position-span'
                // element so we know where the annotation starts and which side to
                // put the annotation on
                const annotateStartPositionSpan = $('#annotate-start-position-span').offset();
                const currentScrollValue = $('#document-container').scrollTop();
                const scrollTo = currentScrollValue + annotateStartPositionSpan.top - $('#document-container').offset().top - 40;
                $('#document-container').animate({
                  scrollTop: scrollTo < 0 ? 0 : scrollTo,
                }, 500, () => {
                  addNewAnnotationToDom(rid);
                  // after text is annotated hide annotate button
                  setTarget(null);
                  setShow();
                });
              } else {
                setShowCannotAnnotateDocumentToast(true);
              }
            }}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
          >
            <Pen />
          </Tooltip>
        )}
      </Overlay>

      <style jsx global>
        {`

          #show-cannot-annotate-document-toast-container {
            position: fixed;
            height: 0px;
            left: 10px;
            top: 130px;
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

          #annotate-document-tooltip, #annotate-document-overlay {
              cursor: pointer;
              z-index: 0;
          }

          .annotation-highlighted-text.filtered {
            background-color: rgba(255,255,10, 0.5);
            transition: background-color 0.5s;
          }

          .annotation-highlighted-text.filtered.active, .annotation-highlighted-text.filtered.active * {
            background: rgba(255, 165, 10, 0.5);
          }

          #document-content-container.unselectable {
            -moz-user-select: -moz-none;
            -khtml-user-select: none;
            -webkit-user-select: none;
            -o-user-select: none;
            user-select: none;
          }
      `}
      </style>
    </>
  );
}
