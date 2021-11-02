/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-danger */
/* eslint-disable no-restricted-syntax */
import React, {
  useState, useEffect, useRef,
} from 'react';
import $ from 'jquery';
import {
  Card,
} from 'react-bootstrap';
import {
  createTextQuoteSelector,
  highlightRange,
} from 'apache-annotator/dom';
import { debounce } from '../../utils/docUIUtils';
import AnnotateButton from '../AnnotateButton';

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
  setShowMaxTextLengthReached,
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
  setShowCannotAnnotateDocumentToast,
}) {
  const myRef = useRef();
  const documentZoomRef = useRef(documentZoom);
  documentZoomRef.current = documentZoom;
  const [position, setPosition] = useState();
  const [selector, setSelector] = useState(null);
  const [selectedTextToAnnotate, setSelectedTextToAnnotate] = useState();

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
    // eslint-disable-next-line no-undef
    const range = document.createRange();
    range.setStart(selection.focusNode, selection.focusOffset);
    range.setEnd(selection.focusNode, selection.focusOffset);
    const rangeClientRects = range.getClientRects();
    if (rangeClientRects.length > 0) {
      const { x: buttonX, y: buttonY } = rangeClientRects[0];

      const selectionRange = selection.getRangeAt(0);
      // eslint-disable-next-line no-undef
      const range2 = document.createRange();
      range2.setStart(selectionRange.startContainer, selectionRange.startOffset);
      range2.setEnd(selectionRange.endContainer, selectionRange.endOffset);
      const range2ClientRects = range2.getClientRects();
      if (range2ClientRects.length > 0) {
        const { x: startX, y: startY } = range2ClientRects[0];
        const { x, y } = $('#document-card-container').get(0).getBoundingClientRect();
        setPosition({
          buttonX: buttonX - x,
          buttonY: buttonY - y,
          startX,
          startY,
          dz: documentZoomRef.current / 100,
        });
        setSelector(mySelector);
      }
    }
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
    const annotateStartPositionSpan = { left: position.startX, top: position.startY };
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
          textSlate: undefined,
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
    const textSelectionCollaspedListener = () => {
      const selection = document.getSelection(); // eslint-disable-line no-undef
      if (selection.rangeCount === 1) {
        const range = selection.getRangeAt(0);
        if (range.collapsed) {
          // if the range collapse meaning that their is no text selected this could me that
          // either the user deselected the text or they clicked the annotate button that deselected
          // the text. Either way the annotate button needs to hide
          setPosition();
        }
      }
    };
    const textSelectionDebounced = debounce(async (documentContainer) => {
      if (!$('#document-content-container').hasClass('unselectable')) {
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
    }, 250, myRef.current);

    // eslint-disable-next-line no-undef
    const removeEventListener2 = document.addEventListener('selectionchange', () => {
      textSelectionCollaspedListener();
      textSelectionDebounced();
    });

    highlightTextForAllAnnotations(annotations);

    return removeEventListener2;
  }, []);

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
      {documentContentContainer}
      <AnnotateButton
        annotationIdBeingEdited={annotationIdBeingEdited}
        annotateDocument={(s, rid) => annotateDocument(s, rid)}
        selector={selector}
        setShowUnsavedChangesToast={setShowUnsavedChangesToast}
        setShowMaxTextLengthReached={setShowMaxTextLengthReached}
        addNewAnnotationToDom={addNewAnnotationToDom}
        setShowCannotAnnotateDocumentToast={setShowCannotAnnotateDocumentToast}
        documentToAnnotate={documentToAnnotate}
        position={position}
        setPosition={setPosition}
      />
      <style jsx global>
        {`

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
