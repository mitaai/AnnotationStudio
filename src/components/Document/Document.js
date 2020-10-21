/* eslint-disable react/destructuring-assignment */
/* eslint-disable no-underscore-dangle */
/* eslint-disable react/no-danger */
/* eslint-disable no-restricted-syntax */
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import { Overlay, Tooltip, Toast } from 'react-bootstrap';
import { Pen } from 'react-bootstrap-icons';
import {
  createTextQuoteSelector,
  highlightRange,
} from 'apache-annotator/dom';

import AnnotationCard from '../AnnotationCard';

const debounce = (func, wait, options) => {
  let timeout;
  return function executedFunction() {
    const later = (opts) => {
      clearTimeout(timeout);
      func(opts);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait, options);
  };
};

const addHoverEventListenersToAllHighlightedText = () => {
  $('.annotation-highlighted-text').on('mouseover', (e) => {
    // highlighting all every piece of the annotation a different color by setting it to active
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`)
      .addClass('active');
    // highligthing the correct annotation on the left or right channel that the user is hovering
    $(`#${$(e.target).attr('annotation-id')}`)
      .addClass('active');

    // we need to higlight any text that is highlighted text but a parent of this dom element.
    // Handle annotating a piece of text inside another piece of annotated text
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`)
      .parents('.annotation-highlighted-text')
      .each((index, elmnt) => {
        // highlighting every piece of text that is highlighted
        // that is the parent of the text that is currently getting hovered
        $(`.annotation-highlighted-text[annotation-id='${$(elmnt).attr('annotation-id')}']`)
          .addClass('active');
        // highlighting the correct annotation that matches this specific highlighted text
        // that is the parent of the text that is currently getting hovered
        $(`#${$(elmnt).attr('annotation-id')}`).addClass('active');
      });
  }).on('mouseout', (e) => {
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`)
      .removeClass('active');
    $(`#${$(e.target).attr('annotation-id')}`)
      .removeClass('active');

    // we need to higlight any text that is highlighted text but a parent of this dom element.
    // Handle annotating a piece of text inside of another piece of annotated text
    $(`.annotation-highlighted-text[annotation-id='${$(e.target)
      .attr('annotation-id')}']`)
      .parents('.annotation-highlighted-text')
      .each((index, elmnt) => {
        // highlighting every piece of text that is highlighted
        // and is the parent of the text that is currently being highlighted
        $(`.annotation-highlighted-text[annotation-id='${$(elmnt).attr('annotation-id')}']`)
          .removeClass('active');
        // highlighting the correct annotation that matches this specific highlighted text
        // that is the parent of the text that is currently getting hovered
        $(`#${$(elmnt).attr('annotation-id')}`)
          .removeClass('active');
      });
  });
};

const highlightText = async (obj, domElement) => {
  const selector = createTextQuoteSelector(obj.selector);
  const matches = selector(domElement);
  for await (const range of matches) {
    // calls matches.next() -> Promise -> resolves -> returns -> {value: '', done: boolean}
    highlightRange(range, 'span', { ...obj.props });
  }
};


const onlyOneMatchForSelector = async (domElement, selectorObj) => {
  // this takes an selector object with keys exact, prefix,
  // and suffix and returns true if there is only one match otherwise false
  let count = 0;
  const selector = createTextQuoteSelector(selectorObj);
  const matches = selector(domElement);
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


const RID = () => {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rid = '';
  for (let i = 0; i < 15; i += 1) {
    const r = Math.random() * c.length;
    rid += c.substring(r, r + 1);
  }
  return rid;
};


export default class Document extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      target: null,
      show: false,
      selector: null,
      selectedTextToAnnotate: false,
      showCannotAnnotateDocumentToast: false,
    };

    const { alerts, setAlerts } = props;

    this.annotationsHighlighted = false;

    this.highlightTextForAllAnnotations = async (_annotations, setChannelAnnotations) => {
      const annotations = {
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
        // so now that we have added the beginning marker we are going to get
        // the position of the begginning marker then remove it from the dom
        const annotationBeginning = $(
          `#document-content-container span[annotation-id='${annotation._id}'] .annotation-beginning-marker`,
        );
        if (annotationBeginning.get(0) === undefined) {
          setAlerts([...alerts, { text: 'unable to annotate a piece of text', variant: 'danger' }]);
        } else {
          const annotationBeginningPosition = annotationBeginning.offset();
          // this takes into account if the user was scrolling through the document
          // as the it was being populated with annotations
          annotationBeginningPosition.top += $('#document-container').scrollTop();
          // now that we have position data we will add the annotation
          // ither to the left or right channel
          // eslint-disable-next-line no-undef
          if (annotationBeginningPosition.left < window.innerWidth / 2) {
            annotations.left.push(
              {
                position:
                {
                  left: annotationBeginningPosition.left,
                  top: annotationBeginningPosition.top,
                },
                ...annotation,
              },
            );
          } else {
            annotations.right.push(
              {
                position:
                {
                  left: annotationBeginningPosition.left,
                  top: annotationBeginningPosition.top,
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
      annotations.left = annotations.left.sort((a, b) => {
        // if the tops are the same then we have to distinguish which
        // annotation comes first by who has the smaller left value
        if (a.position.top - b.position.top === 0) {
          return a.position.left - b.position.left;
        }
        return a.position.top - b.position.top;
      });
      annotations.right = annotations.right.sort((a, b) => {
        // if the tops are the same then we have to distinguish which
        // annotation comes first by who has the smaller left value
        if (a.position.top - b.position.top === 0) {
          return a.position.left - b.position.left;
        }
        return a.position.top - b.position.top;
      });

      setChannelAnnotations(annotations);
      addHoverEventListenersToAllHighlightedText();
    };

    this.positionAnnotateButton = (selection, mySelector) => {
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

      this.setState({ target: element, show: true, selector: mySelector });
    };

    this.addNewAnnotationToDom = (rid) => {
      const annotateStartPositionSpan = $('#annotate-start-position-span').offset();
      annotateStartPositionSpan.top += $('#document-container').scrollTop();
      // eslint-disable-next-line no-undef
      const side = (annotateStartPositionSpan.left < window.innerWidth / 2)
        ? 'left'
        : 'right';

      const {
        user,
        addAnnotationToChannels,
        focusOnAnnotation,
        deleteAnnotationFromChannels,
        updateChannelAnnotationData,
        documentToAnnotate,
      } = this.props;

      const newAnnotation = {
        _id: rid,
        type: 'Annotation',
        creator: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        permissions: {
          groups: [],
          documentOwner: documentToAnnotate.owner === user.id,
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
            ...this.state.selector, // keys -> exact, prefix, suffix
          },
        },
        position: {
          left: annotateStartPositionSpan.left,
          top: annotateStartPositionSpan.top,
        },
      };

      addAnnotationToChannels(side, newAnnotation);

      ReactDOM.render(<AnnotationCard
        focusOnAnnotation={() => {
          focusOnAnnotation(side, newAnnotation._id);
        }}
        DeleteAnnotationFromChannels={deleteAnnotationFromChannels}
        UpdateChannelAnnotationData={updateChannelAnnotationData}
        key={newAnnotation._id}
        side={side}
        expanded={false}
        initializedAsEditing
        annotation={newAnnotation}
        user={user}
      />, document.getElementById(`new-annotation-holder-${side}`)); // eslint-disable-line no-undef
      // after the new annotation has been added to the dom we need to remove it
      // from the the "new-annotation-holder-${side}" and allow it to exist where
      // all the other annoations exist. We do this by unwrapping it
      $(`#${newAnnotation._id}`).unwrap(`#new-annotation-holder-${side}`);
      // once we unwrap the annotation from its holder we need to add the holder back into the dom
      $(`#annotation-channel-${side}`).prepend(`<div id='new-annotation-holder-${side}'></div>`);
      this.setState({ selectedTextToAnnotate: true });
    };
  }


  componentDidMount() {
    // eslint-disable-next-line no-undef
    document.addEventListener('selectionchange', debounce(async (documentContainer) => {
      // we need to make sure that the annotate button disappears
      // while the document selection is being made
      if (this.state.target !== null || this.state.show !== false) {
        this.setState({ target: null, show: false });
      }

      if (!$('#document-content-container').hasClass('unselectable')) {
        // if the reason why the selection change is because you selected text
        // to annotate then don't remove class active from a text that was selected
        // otherwise the selection change so any text that was selected by the user
        // is no longer needed so we need to remove styling
        if (!this.state.selectedTextToAnnotate) {
          // if we are making a new selection we need to make sure all old selections are removed
          $('.text-currently-being-annotated').removeClass('active');
          $('#document-content-container').removeClass('unselectable');
        } else {
          this.setState({ selectedTextToAnnotate: false });
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
              this.positionAnnotateButton(selection, mySelector);
            }
          }
        }
      }

      //
    }, 500, this.myRef.current));
    if (!this.annotationsHighlighted) {
      const { annotations, setChannelAnnotations } = this.props;
      this.annotationsHighlighted = true;
      setTimeout(this.highlightTextForAllAnnotations, 2000, annotations, setChannelAnnotations);
    }
  }

  render() {
    const { documentToAnnotate } = this.props;
    return (
      <>
        <div id="show-cannot-annotate-document-toast-container">
          <Toast
            onClose={() => this.setState({ showCannotAnnotateDocumentToast: false })}
            show={this.state.showCannotAnnotateDocumentToast}
            // delay={8000}
            variant="warning"
          // autohide
          >
            <Toast.Header>
              <strong className="mr-auto">Cannot Annotate Document</strong>
            </Toast.Header>
            <Toast.Body>
              This document is currently a draft so it cannot be annotated at the moment.
            </Toast.Body>
          </Toast>
        </div>


        <div id="document-content-container" ref={this.myRef}>
          <div dangerouslySetInnerHTML={{ __html: documentToAnnotate ? documentToAnnotate.text : '' }} />
        </div>
        <Overlay id="annotate-document-overlay" target={this.state.target} show={this.state.show} placement="top">
          {(props) => (
            <Tooltip
              id="annotate-document-tooltip"
              onClick={() => {
                const { annotateDocument } = this.props;
                if (documentToAnnotate.state !== 'draft') {
                  const rid = RID();
                  annotateDocument(this.state.selector, rid);

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
                  $('#document-container').animate({
                    scrollTop: annotateStartPositionSpan.top,
                  }, 500, () => { this.addNewAnnotationToDom(rid); });
                } else {
                  this.setState({ showCannotAnnotateDocumentToast: true });
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
            }

            .annotation-highlighted-text {
              background-color: rgba(255,255,10, 0.3);
              transition: background-color 0.5s;
            }

            .annotation-highlighted-text.active,  .annotation-highlighted-text.active * {
              background-color: rgba(0, 123, 255, 0.5) !important;
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
}
