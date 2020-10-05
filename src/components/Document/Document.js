import React from 'react';
import $ from 'jquery';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { Pen } from 'react-bootstrap-icons';
import {
  createTextQuoteSelector,
  highlightRange,
  describeTextQuote,
} from 'apache-annotator/dom';


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

async function HighlightText(obj, domElement) {
    const selector = createTextQuoteSelector(obj.selector);
    const matches = selector(domElement);
    for await (const range of matches) {
      // calls matches.next() -> Promise -> resolves -> returns -> {value: '', done: boolean}
      highlightRange(range, 'span', { ...obj.props });
    }
  }
  
  async function HighlightTextToAnnotate(mySelector) {
    // this function takes a object selector and it highlights it accordingly so that the user knows what they are about to annotate
    const obj = {
      selector: mySelector,
      props: {
        class: 'text-currently-being-annotated active',
      },
    };
  
    // before we highlight the tex to annotate we need to make sure to unhighlight text that was trying to be annotated by the user previously
    $('.text-currently-being-annotated').removeClass('text-currently-being-annotated active');
  
    HighlightText(obj, $('#document-content-container').get(0));
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
       console.log("mySelector", {
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

      //if the reason why the selection change is because you selected text to annotate then don't remove class active from a text that was selected
      // otherwise the selection change so any text that was selected by the user is no longer needed so we need to remove styling
      if (!this.state.selectedTextToAnnotate) {
        // if we are making a new selection we need to make sure all old selections are removed
        $('.text-currently-being-annotated').removeClass('active');
      } else {
        this.setState({ selectedTextToAnnotate: false });
      }

      const selection = document.getSelection();
      // console.log('selection', selection);
      if (selection.rangeCount === 1) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed && range.toString().length > 0) {
          // make sure the range is something
          // console.log('range', range);

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
      //
    }, 500, this.myRef.current));
  }


  render() {
    return (
      <>
        <div id="document-content-container" ref={this.myRef}>
          <span>hello</span>
          <span>{this.props.children}</span>
        </div>
        <Overlay id="annotate-document-overlay" target={this.state.target} show={this.state.show} placement="top">
          {(props) => (
            <Tooltip
              id="annotate-document-tooltip"
              onClick={() => {
                this.props.annotateDocument(this.state.selector);
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
        `}
        </style>
      </>
    );
  }
}
