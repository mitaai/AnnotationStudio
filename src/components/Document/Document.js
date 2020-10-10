/* eslint-disable react/no-danger */
import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import moment from 'moment';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { Pen } from 'react-bootstrap-icons';
import {
  createTextQuoteSelector,
  highlightRange,
  describeTextQuote,
} from 'apache-annotator/dom';

import AnnotationCard from '../AnnotationCard';


const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const debounceModified = (func, wait, options) => {
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

function AddHoverEventListenersToAllHighlightedText() {
  // console.log('annotation-highlighted-text', $('.annotation-highlighted-text'));
  $('.annotation-highlighted-text').on('mouseover', (e) => {
    // highlighting all every piece of the annotation a different color by setting it to active
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).addClass('active');
    // highligthing the correct annotation on the left or right channel that the user is hovering
    $(`#${$(e.target).attr('annotation-id')}`).addClass('active');

    // we need to higlight any text that is highlighted text but a parent of this dom element. This is what happens if somone annotates a piece of text inside of another piece of annotated text
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).parents('.annotation-highlighted-text').each((index, elmnt) => {
      // highlighting ever piece of text that is highlighted and is the parent of the text that is currently being highlighted
      $(`.annotation-highlighted-text[annotation-id='${$(elmnt).attr('annotation-id')}']`).addClass('active');
      // highlighting the correct annotation that matches this specific highlighted text that is the parent of the text that is currently getting hovered
      $(`#${$(elmnt).attr('annotation-id')}`).addClass('active');
    });
  }).on('mouseout', (e) => {
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).removeClass('active');
    $(`#${$(e.target).attr('annotation-id')}`).removeClass('active');

    // we need to higlight any text that is highlighted text but a parent of this dom element. This is what happens if somone annotates a piece of text inside of another piece of annotated text
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).parents('.annotation-highlighted-text').each((index, elmnt) => {
      // highlighting ever piece of text that is highlighted and is the parent of the text that is currently being highlighted
      $(`.annotation-highlighted-text[annotation-id='${$(elmnt).attr('annotation-id')}']`).removeClass('active');
      // highlighting the correct annotation that matches this specific highlighted text that is the parent of the text that is currently getting hovered
      $(`#${$(elmnt).attr('annotation-id')}`).removeClass('active');
    });
  });
}

async function HighlightText(obj, domElement) {
  const selector = createTextQuoteSelector(obj.selector);
  const matches = selector(domElement);
  for await (const range of matches) {
    // calls matches.next() -> Promise -> resolves -> returns -> {value: '', done: boolean}
    highlightRange(range, 'span', { ...obj.props });
  }
}


async function OnlyOneMatchForSelector(domElement, selectorObj) {
  // this takes an selector object with keys exact, prefix, and suffix and returns true if there is only one match otherwise false
  let count = 0;
  const selector = createTextQuoteSelector(selectorObj);
  const matches = selector(domElement);
  for await (const range of matches) {
    if (count == 0) { // if we haven't found a match yet then we need to record this match
      count++;
    } else { return false; }// if we have already found a match then we need to return false immediately to say that there is more than one match
  }


  return true;
}

async function CustomDescibeTextQuote(range, scope) {
  const RangePrefix = document.createRange();
  RangePrefix.setStart(scope.startContainer, scope.startOffset);
  RangePrefix.setEnd(range.startContainer, range.startOffset);
  const RangeSuffix = document.createRange();
  RangeSuffix.setStart(range.endContainer, range.endOffset);
  RangeSuffix.setEnd(scope.endContainer, scope.endOffset);
  const fullTextSelector = { // this holds the whole document in the form of a prefix, the text we want to select, and then everything after that.
    exact: range.toString(),
    prefix: RangePrefix.toString(),
    suffix: RangeSuffix.toString(),
  };

  let textSelectorIsUnique = false;
  const maxCharacterLength = Math.max(fullTextSelector.prefix.length, fullTextSelector.suffix.length);
  for (let numOfCharacters = 20; numOfCharacters < maxCharacterLength; numOfCharacters += 15) {
    textSelectorIsUnique = await OnlyOneMatchForSelector($('#document-content-container').get(0), {
      exact: fullTextSelector.exact,
      prefix: fullTextSelector.prefix.slice(-1 * numOfCharacters),
      suffix: fullTextSelector.suffix.slice(0, numOfCharacters),
    });
    console.log('textSelectorIsUnique', textSelectorIsUnique);
    if (textSelectorIsUnique) {
      console.log('mySelector', {
        exact: fullTextSelector.exact,
        prefix: fullTextSelector.prefix.slice(-1 * numOfCharacters),
        suffix: fullTextSelector.suffix.slice(0, numOfCharacters),
      });

      return {
        exact: fullTextSelector.exact,
        prefix: fullTextSelector.prefix.slice(-1 * numOfCharacters),
        suffix: fullTextSelector.suffix.slice(0, numOfCharacters),
      };
    }
  }

  // if we couldn't find a unique match just return the full selector
  return fullTextSelector;
}


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
  const marginBottom = 8;
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
    // if where you are is greater than where you can be then we have to set your position to where you can be. Otherwise just set your position to where you are
    if (lastLowestPoint - $(`#document-container #${annotations[i]._id}`).height() - marginBottom < $(`#document-container #${annotations[i]._id}`).position().top) {
      top = lastLowestPoint - $(`#document-container #${annotations[i]._id}`).height() - marginBottom;
    } else {
      top = $(`#document-container #${annotations[i]._id}`).position().top;
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


function RID() {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rid = '';
  for (let i = 0; i < 15; i++) {
    const r = Math.random() * c.length;
    rid += c.substring(r, r + 1);
  }

  return rid;
}


export default class Document extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      target: null,
      show: false,
      selector: null,
      selectedTextToAnnotate: false,
    };

    this.annotationsHighlighted = false;

    this.HighlightTextForAllAnnotations = async function (_annotations, setChannelAnnotations) {
      const annotations = {
        left: [],
        right: [],
      };
      for await (const annotation of _annotations) {
        await HighlightText({ selector: annotation.selector, props: { 'annotation-id': annotation._id, class: 'annotation-highlighted-text' } }, $('#document-content-container').get(0));

        // after we highlight everything in the document we need to figure out the position of where these highlights are and divide the array of annotations we were given into two array representing left and right side channel and then add position data to the annotation object.
        $($(`#document-content-container span[annotation-id='${annotation._id}']`).get(0)).prepend("<span class='annotation-beginning-marker'></span>");
        // so now that we have added the beginning marker we are going to get the position of the begginning market then remove it from the dom
        const annotationBeginning = $(`#document-content-container span[annotation-id='${annotation._id}'] .annotation-beginning-marker`);
        if (annotationBeginning.get(0) == undefined) {
          console.log('unable to annotation a piece of text');
        } else {
          const annotationBeginningPosition = annotationBeginning.offset();
          annotationBeginningPosition.top += $('#document-container').scrollTop(); // this takes into account if the user was scrolling through the document as the it was being populated with annotations
          // console.log(annotationBeginningPosition, annotationBeginning.position());
          // now that we have position data we will add the annotation either to the left or right channel
          if (annotationBeginningPosition.left < window.innerWidth / 2) {
            annotations.left.push({ position: { left: annotationBeginningPosition.left, top: annotationBeginningPosition.top }, ...annotation });
          } else {
            annotations.right.push({ position: { left: annotationBeginningPosition.left, top: annotationBeginningPosition.top }, ...annotation });
          }
        }
      }

      // now that we have organized the annotations by left and right we need them to be displayed in the their correct channels
      // before we set the channel annotations we are going to save this data in the dom to be retrieved later by other components
      annotations.left = annotations.left.sort((a, b) => {
        if (a.position.top - b.position.top === 0) { // if the tops are the same then we have to distinguish which annotation comes first by who has the smaller left value
          return a.position.left - b.position.left;
        }
        return a.position.top - b.position.top;
      });
      annotations.right = annotations.right.sort((a, b) => {
        if (a.position.top - b.position.top === 0) { // if the tops are the same then we have to distinguish which annotation comes first by who has the smaller left value
          return a.position.left - b.position.left;
        }
        return a.position.top - b.position.top;
      });
      $('#document-container').attr('annotations', JSON.stringify(annotations));
      setChannelAnnotations(annotations);
      AddHoverEventListenersToAllHighlightedText();
    };


    this.PositionAnnotateButton = function (selection, mySelector) {
      // we need to remove the existing marker for the annotate btn position before we put another
      if ($('#annotate-btn-position-node').get(0) != null) {
        $('#annotate-btn-position-node').remove();
      }


      const range = document.createRange();
      const newNode = document.createElement('span');
      newNode.setAttribute('id', 'annotate-btn-position-node');
      range.setStart(selection.focusNode, selection.focusOffset);
      range.setEnd(selection.focusNode, selection.focusOffset);
      range.insertNode(newNode);
      // now that the node is inserted we can get its position so that we can place the annotate button in the right place
      const element = document.getElementById('annotate-btn-position-node');
      const annotateBtnPos = {
        left: element.offsetLeft,
        top: element.offsetTop,
      };

      // console.log('element', element);

      this.setState({ target: element, show: true, selector: mySelector });

      // console.log('annotateBtnPos', annotateBtnPos);
    };
  }


  componentDidMount() {
    document.addEventListener('selectionchange', debounceModified(async (documentContainer) => {
      // we need to make sure that the annotate button disappears while the document selection is being made
      if (this.state.target != null || this.state.show != false) {
        this.setState({ target: null, show: false });
      }

      if (!$('#document-content-container').hasClass('unselectable')) {
        // if the reason why the selection change is because you selected text to annotate then don't remove class active from a text that was selected
        // otherwise the selection change so any text that was selected by the user is no longer needed so we need to remove styling
        if (!this.state.selectedTextToAnnotate) {
        // if we are making a new selection we need to make sure all old selections are removed
          $('.text-currently-being-annotated').removeClass('active');
          $('#document-content-container').removeClass('unselectable');
        } else {
          this.setState({ selectedTextToAnnotate: false });
        }

        const selection = document.getSelection();
        // console.log('selection', selection);
        if (selection.rangeCount === 1) {
          const range = selection.getRangeAt(0);
          if (!range.collapsed && range.toString().length > 0) {
          // we need to make sure this selection happened inside the document card container and not some where outside of the document
            if ($(range.commonAncestorContainer.parentElement).parents('#document-card-container').length !== 0) {
            // make sure the range is something
            // console.log('range', range.commonAncestorContainer.parentElement);
              const scope = document.createRange();
              // console.log('documentContainer', documentContainer);
              scope.selectNodeContents(documentContainer);
              // console.log('scope', scope);
              // we need to make sure that the selection the user made is inside the scope, meaning that everything they selected is inside the document and not outside the document
              // if (range.compareBoundaryPoints(Range.START_TO_START, scope) != -1 && range.compareBoundaryPoints(Range.END_TO_END, scope) != 1) {
              const mySelector = await CustomDescibeTextQuote(range, scope);
              // console.log(mySelector);
              this.PositionAnnotateButton(selection, mySelector);
            // } else { console.log('outside of bounds'); }
            }
          }
        }
      }

      //
    }, 500, this.myRef.current));
    if (!this.annotationsHighlighted) {
      this.annotationsHighlighted = true;
      setTimeout(this.HighlightTextForAllAnnotations, 2000, this.props.annotations, this.props.setChannelAnnotations);
    }
  }


  render() {
    return (
      <>
        <div id="document-content-container" ref={this.myRef}>
          <div dangerouslySetInnerHTML={{ __html: this.props.documentText }} />
        </div>
        <Overlay id="annotate-document-overlay" target={this.state.target} show={this.state.show} placement="top">
          {(props) => (
            <Tooltip
              id="annotate-document-tooltip"
              onClick={() => {
                const rid = RID();
                this.props.annotateDocument(this.state.selector, rid);

                // when the user clicks to annotate the piece of text that is selected we need to grab information about all the annotations currently showing in the dom then we need to place this new annotation into that object along with the annotations position data then once we have set this new information we need to save it by reseting the dom element attribute "annotations" then use the new data and use the updated data and pass it into "MoveAnnotationsToCorrectSpotBasedOnFocus" function

                // first grabbing position data on the annotation button so we can know which side to put the annotation on
                const annotationBtnPosition = $('#annotate-btn-position-node').offset();
                annotationBtnPosition.top += $('#document-container').scrollTop();
                const side = (annotationBtnPosition.left < window.innerWidth / 2) ? 'left' : 'right';
                // now that we know which side to get the annotation data from we will grab the current data and update it
                const annotationChannelData = JSON.parse($('#document-container').attr('annotations'));
                const newAnnotation = {
                  _id: rid,
                  user: 'Joshua Mbogo',
                  annotation: '',
                  date: moment().format('MM/DD/YYYY'),
                  tags: [],
                  public: true,
                  selector: { ...this.state.selector },
                  position: {
                    left: annotationBtnPosition.left,
                    top: annotationBtnPosition.top,
                  },
                };
                // we need to figure out where we need to add this new annotation inside this annotations array
                let indexForNewAnnotation = annotationChannelData[side].findIndex((annotation) => {
                  if (newAnnotation.position.top - annotation.position.top === 0) { // if the tops are the same then we have to distinguish which annotation comes first by who has the smaller left value
                    return newAnnotation.position.left < annotation.position.left;
                  }
                  return newAnnotation.position.top < annotation.position.top;
                });

                // make sure that if we can't find a place to put the new annotation we put it at the end of the existing list of annotations
                indexForNewAnnotation = indexForNewAnnotation === -1 ? annotationChannelData[side].length : indexForNewAnnotation;

                // updating annotation channel data with new annotation
                annotationChannelData[side].splice(indexForNewAnnotation, 0, newAnnotation);
                // saving updated data in dom
                $('#document-container').attr('annotations', JSON.stringify(annotationChannelData));


                ReactDOM.render(<AnnotationCard
                  focusOnAnnotation={() => {
                    MoveAnnotationsToCorrectSpotBasedOnFocus(side, newAnnotation._id);
                  }}
                  key={newAnnotation._id}
                  side={side}
                  expanded={false}
                  initializedAsEditing
                  annotation={newAnnotation}
                />, document.getElementById(`new-annotation-holder-${side}`));
                // after the new annotation has been added to the dom we need to remove it from the the "new-annotation-holder-${side}" and allow it to exist where all the other annoations exist. We do this by unwrapping it
                $(`#${newAnnotation._id}`).unwrap(`#new-annotation-holder-${side}`);
                // once we unwrap the annotation from its holder we need to add the holder back into the dom
                $(`#annotation-channel-${side}`).prepend(`<div id='new-annotation-holder-${side}'></div>`);
                this.setState({ selectedTextToAnnotate: true });
              }}
              {...props}
            >
              <Pen />
            </Tooltip>
          )}
        </Overlay>

        <style jsx global>
          {`
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
