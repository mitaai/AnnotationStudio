/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useState, useMemo, useEffect,
} from 'react';
import $ from 'jquery';
import {
  Spinner,
} from 'react-bootstrap';
import { createEditor } from 'slate';
import {
  Slate, withReact,
} from 'slate-react';
import {
  DEFAULTS_LIST,
  DEFAULTS_TABLE,
  EditablePlugins,
  pipe,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withList,
  withMarks,
  withTable,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import unfetch from 'unfetch';
import { plugins, withDivs } from '../../../utils/slateUtil';
import SlateToolbar from '../../SlateToolbar';
import styles from './ISOutline.module.scss';
import { DeepCopyObj } from '../../../utils/docUIUtils';
import Document from '../../Document/Document';
// import VerticalBar from '../../VerticalBar';
import { getDocumentBySlug } from '../../../utils/docUtil';
import CommentCard from '../../CommentCard';

const ISOutline = ({
  session,
  convertAnnotationTilesToImages,
  processSourceTextAnalysisResults,
  exportDocument,
  selection,
  clearSelection,
  document,
  setDocument,
  getDroppedAnnotationsData,
  hydrateOutlineData,
  readOnly,
  setReadOnly,
  annotationsBeingDragged,
  setAnnotationsBeingDragged,
  sourceTextMode,
  setSourceTextMode,
  showSourceTextDropdown,
  setShowSourceTextDropdown,
  setAlerts,
  setSourceTextHeaderTitle,
}) => {
  // console.log('document', document);
  const [documentZoom, setDocumentZoom] = useState(100);
  const [documentHeight, setDocumentHeight] = useState();

  // 'TAUI' stands for 'text analysis UI'
  const [applyTAUI, setApplyTAUI] = useState();
  const [foundNGrams, setFoundNGrams] = useState();
  const [commentCards, setCommentCards] = useState();

  // eslint-disable-next-line no-unused-vars
  const [veriticalBars, setVerticalBars] = useState([]);

  const [loadingSourceText, setLoadingSourceText] = useState();

  const [loadedDocuments, setLoadedDocuments] = useState({});
  const [selectedSourceDocumentId, setSelectedSourceDocumentId] = useState();
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [orderOfSelectedDocuments, setOrderOfSelectedDocuments] = useState([]);
  const [analysisMode, setAnalysisMode] = useState(sourceTextMode);
  const [sourceTextAnalysisResults, setSourceTextAnalysisResults] = useState();
  const [slateLoading, setSlateLoading] = useState(false);
  const [removeDropzones, setRemoveDropzones] = useState(false);
  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withCodeBlock(),
    withInlineVoid({ plugins }),
    withList(DEFAULTS_LIST),
    withMarks(),
    withTable(DEFAULTS_TABLE),
    withDeserializeHTML({ plugins }),
    withDivs(),
  ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const updateLoadedDocuments = (doc) => {
    const newDocs = DeepCopyObj(loadedDocuments);
    newDocs[doc.id] = doc;
    setLoadedDocuments(newDocs);
  };

  const setD = (doc, bool) => {
    setDocument(doc);
    setApplyTAUI(bool);
  };


  const scale = documentZoom / 100;
  const spacing = 20;
  const documentWidth = 750;

  const extraWidth = 0;
  const documentIsPDF = false;
  // document && document.uploadContentType && document.uploadContentType.includes('pdf');

  const sourceText = selectedSourceDocumentId
    ? loadedDocuments[selectedSourceDocumentId]
    : undefined;


  const states = {
    outlines: {
      commentCardWell: {
        opacity: 0,
      },
      docPos: `calc(50% - ${documentWidth / 2}px)`,
      containerPosWidth: '100%',
      toolbarPos: `calc(50% - ${documentWidth / 2}px)`,
      line: {
        height: 0,
        opacity: 0,
      },
      stContainer: {
        left: '100%',
        opacity: 0,
      },
    },
    analysis: {
      commentCardWell: {
        opacity: 1,
      },
      docPos: `calc(100% - ${documentWidth}px - 40px)`,
      containerPosWidth: '100%',
      toolbarPos: `calc(100% - ${documentWidth}px)`,
      line: {
        height: 0,
        opacity: 0,
      },
      stContainer: {
        left: '100%',
        opacity: 0,
      },
    },
    st: {
      commentCardWell: {
        opacity: 0,
      },
      docPos: `calc(100% - ${documentWidth}px - ${spacing}px - 20px)`,
      containerPosWidth: '50%',
      toolbarPos: `calc(50% - ${documentWidth}px - ${spacing}px - 20px)`,
      line: {
        height: 'calc(100% - 10px)',
        opacity: 1,
      },
      stContainer: {
        left: '50%',
        opacity: 1,
        width: '50%',
      },
    },
  };

  let state = states.outlines;

  if (sourceTextMode) {
    state = states.st;
  } else if (analysisMode) {
    state = states.analysis;
  }

  const {
    docPos,
    containerPosWidth,
    toolbarPos,
    line: lineState,
    stContainer,
  } = state;

  const selectAndUpdateLoadedDocuments = ({ document: doc, selected }) => {
    updateLoadedDocuments(doc);
    if (selected) {
      setSelectedSourceDocumentId(doc.id);
    }
  };

  const openDocument = async (slug) => {
    setLoadingSourceText(true);
    getDocumentBySlug(slug)
      .then((doc) => {
        const cloudfrontUrl = process.env.NEXT_PUBLIC_SIGNING_URL.split('/url')[0];
        if (doc && doc.text
          && doc.text.length < 255 && doc.text.includes(cloudfrontUrl)) {
          unfetch(doc.text.substring(
            doc.text.indexOf(cloudfrontUrl), doc.text.indexOf('.html') + 5,
          ), {
            method: 'GET',
            headers: {
              'Content-Type': 'text/html',
            },
          }).then((res) => {
            res.text().then((result) => {
              // replacing the cloudfront url with the actual text result from the url
              selectAndUpdateLoadedDocuments({
                document: { ...doc, text: result },
                selected: true,
              });
              setLoadingSourceText();
            });
          }).catch(() => {
            selectAndUpdateLoadedDocuments({ document: doc, selected: true });
            setLoadingSourceText();
          });
        } else {
          selectAndUpdateLoadedDocuments({ document: doc, selected: true });
          setLoadingSourceText();
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  const removeAnalysisFromDocument = (doc) => {
    const d = DeepCopyObj(doc);
    const removeAnalysis = (obj) => {
      let newObj = DeepCopyObj(obj);
      if (Array.isArray(obj)) {
        newObj = [];
        for (let i = 0; i < obj.length; i += 1) {
          const res = removeAnalysis(obj[i]);
          console.log('res', res);
          // if the value is undefined that means that this element was an empty text object and
          // for this reason we shouldn't add it back to the document structure
          if (res) {
            newObj.push(res);
          }
        }
      } else if (obj.children) {
        delete newObj.nGramsIds;
        if (newObj.nGramIds) {
          delete newObj.nGramIds;
        }
        newObj.children = removeAnalysis(obj.children);
      } else if (obj.textAnalysisComment) {
        // deleting all the stuff that was created by the analysis
        delete newObj.textAnalysisComment;
        delete newObj.endTagIds;
        delete newObj.startTagIds;

        if (newObj.text.length === 0) {
          // this is an empty text object so we can just return undefined which will be filtered
          // out higher up in the recursive stack
          return undefined;
        }
      }

      return newObj;
    };

    return removeAnalysis(d);
  };

  const addDropzonesToSlateValue = (arr, parentType, currentPosArray = []) => {
    const newArr = [];
    for (let i = 0; i < arr.length; i += 1) {
      const {
        type,
        children,
        text,
        dropzoneType,
      } = arr[i];
      if (dropzoneType === undefined) {
        if (text !== undefined) {
          newArr.push(arr[i]);
        } else if (children) {
          newArr.push({ ...arr[i], children: addDropzonesToSlateValue(children, type, currentPosArray.concat([i, 'children'])) });
          if (parentType === undefined || (!['li'].includes(parentType) && type !== 'p')) {
            newArr.push({
              type: 'dropzone',
              dropzoneType: type,
              children: [{ text: '' }],
              props: {
                posArray: currentPosArray.concat([i + 1]),
                getDroppedAnnotationsData,
                hydrateOutlineData,
                document,
                setDocument: setD,
                setRemoveDropzones,
              },
            });
          }
        }
      }
    }
    return newArr;
  };

  const removeDropzonesFromSlateValue = (arr) => {
    const newArr = [];
    for (let i = 0; i < arr.length; i += 1) {
      const {
        children,
        text,
        dropzoneType,
      } = arr[i];
      if (dropzoneType === undefined) {
        if (text !== undefined) {
          newArr.push(arr[i]);
        } else {
          newArr.push({ ...arr[i], children: children && removeDropzonesFromSlateValue(children) });
        }
      }
    }

    return newArr;
  };

  // console.log('sourceTextAnalysisResults', sourceTextAnalysisResults);


  useEffect(() => {
    if (selectedSourceDocumentId) {
      setSourceTextHeaderTitle(selectedDocuments[selectedSourceDocumentId].title);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSourceDocumentId]);

  useEffect(() => {
    console.log('sourceTextAnalysisResults changed');
    if (sourceTextAnalysisResults) {
      console.log('processSourceTextAnalysisResults');
      console.log('sourceTextAnalysisResults', sourceTextAnalysisResults);
      let res;
      try {
        res = processSourceTextAnalysisResults(sourceTextAnalysisResults);
      } catch (err) {
        console.log('err', err);
      }
      if (res) {
        setFoundNGrams(res.foundNGrams);
        setD(res.document, true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceTextAnalysisResults]);

  useEffect(() => {
    if (foundNGrams) {
      const newCommentCards = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const { id, size, documentId } of foundNGrams) {
        const s = parseInt(size, 10);
        let type = 'comment';
        if (s === 4) {
          type = 'warning';
        } else if (s >= 5) {
          type = 'danger';
        }
        newCommentCards.push(
          <CommentCard
            id={id}
            type={type}
            setSourceTextMode={setSourceTextMode}
            openDocument={openDocument}
            documents={[selectedDocuments[documentId]]}
          />,
        );
      }

      setCommentCards(newCommentCards);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundNGrams]);

  useEffect(() => {
    // if this variable changes that means that any comment card currently visible will have the
    // wrong position becuase elements are moving around so we are going to hide them
    $('#comment-card-well .comment-card.visible')
      .css({ top: 0, left: -500 })
      .removeClass('left middle right visible');
  }, [sourceTextMode]);

  useEffect(() => {
    $('#comment-card-well .comment-card').css({ top: 0, left: -500 });
    $('#comment-card-well .comment-card').hover(() => {
      // onmouseover
    }, (ev) => {
      // onmouseoout
      const commentCardId = ev.currentTarget.id.split('-')[2];
      if ($(ev.relatedTarget).parents(`[ta-${commentCardId}='true']`).length === 0) {
        // this means the user hovered away from the comment to unrelated texted. The opposite
        // being the user hovered away from the comment into the highlighted text related to the
        // comment

        // hiding the comment card and removing hover class from the commented text
        $(`#comment-card-${commentCardId}`)
          .css({ top: 0, left: -500 })
          .removeClass('left middle right visible');

        $(`[ta-${commentCardId}='true']`).removeClass('hover');
      }
    });
  }, [commentCards]);

  useEffect(() => {
    if (applyTAUI && foundNGrams) {
      const {
        x: containerX,
        y: containerY,
      } = $('#comment-card-well').get(0).getBoundingClientRect();
      // eslint-disable-next-line no-restricted-syntax
      for (const { id, size } of foundNGrams) {
        const elmnt = $(`[ta-${id}='true']`);
        elmnt.addClass(size > 3 ? 'ta-comment' : 'ta-comment');
        elmnt.hover((ev) => {
          // onmouseover

          // This code positions and makes the comment card visible.
          // If it is already visible we don't need to do anything so were checking if it is already
          // visible
          const commentCard = $(`#comment-card-${id}`);
          if (commentCard.hasClass('visible')) {
            return;
          }

          const { clientX, clientY } = ev;
          let y = clientY;

          // we need to check which of the clientRects the clientX and clientY fall into and adjust
          // the clientY value so that the comment card always is placed at the top of the selected
          // text
          // eslint-disable-next-line no-restricted-syntax
          for (const [, DOMRect] of Object.entries($(ev.target).get(0).getClientRects())) {
            if (clientX >= DOMRect.x - 2 && clientX <= DOMRect.x + DOMRect.width
              && clientY >= DOMRect.y && clientY <= DOMRect.y + DOMRect.height) {
              // this means that this is the clientRect that the mouse is currently hovered over so
              // we need to adjust the y value based off of this clientRect
              y = DOMRect.y;
              break;
            }
          }

          $(`[ta-${id}='true']`).addClass('hover');
          const documentPos = $('#outline-container').get(0).getBoundingClientRect().x;
          const {
            height: commentCardHeight,
            width: commentCardWidth,
          } = commentCard.get(0).getBoundingClientRect();
          const commentCardPointerHeight = 8;
          const top = $('#outline-container-wrapper').scrollTop() + y - containerY - commentCardHeight - commentCardPointerHeight;
          const left = clientX - containerX;

          if (left < documentPos + documentWidth / 3) {
            // the comment card will have its pointer to the left side of itself
            commentCard.css({ top, left: left - 19, opacity: 1 });
            commentCard.addClass('left visible');
            commentCard.removeClass('right middle');
          } else if (left < documentPos + 2 * (documentWidth / 3)) {
            // the comment card will have its pointer to the middle of itself
            commentCard.css({ top, left: left + 25 - commentCardWidth / 2 - 20, opacity: 1 });
            commentCard.addClass('middle visible');
            commentCard.removeClass('left right');
          } else {
            // the comment card will have its pointer to the right side of itself
            commentCard.css({ top, left: left + 20 - commentCardWidth, opacity: 1 });
            commentCard.addClass('right visible');
            commentCard.removeClass('left middle');
          }
        }, (ev) => {
          // onmouseout
          if ($(ev.relatedTarget).parents('.comment-card').length === 0) {
            // this means that user hovered away from the highlighted text analysis. The opposite
            // being that they hovered their mouse over the comment card itself.
            const commentCard = $(`#comment-card-${id}`);
            commentCard.removeClass('left middle right visible');
            commentCard.css({ top: 0, left: -500 });
            $(`[ta-${id}='true']`).removeClass('hover');
          }
        });
      }
    }
    setApplyTAUI();
  }, [applyTAUI]);

  useEffect(() => {
    if (!analysisMode) {
      // if analysis mode is false we need to clear any source text analysis data
      setSourceTextAnalysisResults();
      setD(removeAnalysisFromDocument(document));
    }
  }, [analysisMode]);


  useEffect(() => {
    setSlateLoading(false);
    if (removeDropzones) {
      setAnnotationsBeingDragged();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, removeDropzones]);

  useEffect(() => {
    if (selection) {
      if (readOnly) {
        editor.selection = selection;
        // this clears the selection variable but not the editors selection so that the editors
        // selection doesn't get influenced by the parameter selection until the next time we
        // want to manually move the cursor outside of the editors control
        clearSelection();
        setReadOnly();
      } else {
        setReadOnly(true);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection, readOnly]);

  useEffect(() => {
    if ($('#document-card-container')) {
      setDocumentHeight($('#document-card-container')[0].getBoundingClientRect().height);
    }
    /*

    const newVerticalBars = [];
    const {
      x: containerX,
      y: containerY,
    } = $('#vertical-bar-well').get(0).getBoundingClientRect();
    // everytime the document changes we need to update the vertical bars to the left of every
    // element in the document object
    $("[data-slate-node='element']").each((index, domElement) => {
      const elmnt = $(domElement);
      if (elmnt.find("[text-analysis='true']").length < 0) {
        return;
      }

      const { x, y, height } = elmnt.get(0).getBoundingClientRect();
      const top = $('#outline-container-wrapper').scrollTop() + y - containerY;
      const left = x - containerX - 16;
      newVerticalBars.push(<VerticalBar
        key={index}
        left={left}
        top={top}
        height={height}
        fill="#015999"
      />);
    });

    setVerticalBars(newVerticalBars);
    */
  }, [document]);

  return (
    <>
      <Slate
        editor={editor}
        value={annotationsBeingDragged ? addDropzonesToSlateValue(document) : document}
        disabled={false}
        onChange={(value) => {
          setSlateLoading(false);
          setD(removeDropzonesFromSlateValue(value), true);
        }}
      >
        <SlateToolbar
          id="hello"
          key="goodbye"
          disabled={false}
          exportButton
          runAnalysisButton
          session={session}
          convertAnnotationTilesToImages={convertAnnotationTilesToImages}
          analysisMode={analysisMode}
          setAnalysisMode={setAnalysisMode}
          exportDocument={exportDocument}
          setSourceTextAnalysisResults={setSourceTextAnalysisResults}
          sourceTextMode={sourceTextMode}
          setSourceTextMode={setSourceTextMode}
          toolbarPos={toolbarPos}
          stContainer={stContainer}
          showSourceTextDropdown={showSourceTextDropdown}
          setShowSourceTextDropdown={setShowSourceTextDropdown}
          documentZoom={documentZoom}
          setDocumentZoom={setDocumentZoom}
          selectedDocuments={selectedDocuments}
          setSelectedDocuments={setSelectedDocuments}
          orderOfSelectedDocuments={orderOfSelectedDocuments}
          setOrderOfSelectedDocuments={setOrderOfSelectedDocuments}
          selectedSourceDocumentId={selectedSourceDocumentId}
          loadedDocuments={loadedDocuments}
          openDocument={openDocument}
        />
        {slateLoading && (
        <div className={styles['slate-loader']}>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <div className="text-center">
            <h4 className="text-muted">
              <em>Please wait, processing pasted content.</em>
            </h4>
            <small className="text-muted">
              The page may become unresponsive. Please do not
              close or navigate away from the page.
            </small>
          </div>
        </div>
        )}
        <div id="outline-container-container">
          <div style={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            backgroundColor: '#DADCE0',
            width: 1,
            transition: 'all 0.5s',
            ...lineState,
          }}
          />
          <div
            id="document-container"
            style={{
              ...stContainer,
              position: 'absolute',
              top: 0,
              left: '50%',
              height: 'calc(100% - 5px)',
              padding: '20px',
            }}
          >
            <div
              style={{ width: documentWidth * scale, height: (documentHeight * scale) || 100 }}
            />
            <div
              id="document-container-col"
              style={{
                transform: `scale(${scale}) translateY(0px)`,
                transformOrigin: 'top left',
                minWidth: documentWidth,
                maxWidth: documentWidth,
                position: 'absolute',
                top: 20,
              }}
            >
              <Document
                setShowUnsavedChangesToast={() => {}}
                setShowMaxTextLengthReached={() => {}}
                annotationIdBeingEdited={undefined}
                addActiveAnnotation={() => {}}
                removeActiveAnnotation={() => {}}
                displayAnnotationsInChannels={false}
                setChannelAnnotations={() => {}}
                annotations={[]}
                documentHighlightedAndLoaded
                addAnnotationToChannels={() => {}}
                annotateDocument={() => {}}
                documentToAnnotate={sourceText}
                documentZoom={documentZoom}
                alerts={[]}
                setAlerts={setAlerts}
                user={session ? session.user : undefined}
                showCannotAnnotateDocumentToast={false}
                setShowCannotAnnotateDocumentToast={() => {}}
                loadingDocument={loadingSourceText}
              />
            </div>
          </div>
          <div
            id="outline-container-wrapper"
            style={{
              position: 'absolute',
              top: 0,
              width: containerPosWidth,
              overflow: 'scroll',
              height: 'calc(100vh - 303px)',
              transition: 'all 0.5s',
              padding: '20px 0px',
            }}
          >
            <div
              id="vertical-bar-well"
              style={{
                position: 'absolute',
                left: docPos,
                transition: 'all 0.5s',
                zIndex: 2,
              }}
            >
              {veriticalBars}
            </div>
            <div
              id="comment-card-well"
              style={{
                position: 'absolute',
                transition: 'all 0.5s',
                zIndex: 2,
              }}
            >
              {commentCards}
            </div>
            <EditablePlugins
              readOnly={readOnly}
              plugins={plugins}
              disabled={false}
              onKeyDown={[(e) => {
                const isPasteCapture = (e.ctrlKey || e.metaKey)
            && e.keyCode === 86;
                if (isPasteCapture) {
                  setSlateLoading(true);
                }
              }]}
              placeholder="Paste or type here"
              id="outline-container"
              className={styles['slate-editor']}
            />
          </div>
        </div>
      </Slate>
      <style jsx global>
        {`
            [data-testid='slate-toolbar'] {
              border-radius: 0px;
            }

            #outline-container-container {
              height: calc(100vh - 303px);
              padding: 20px 0px;
              overflow: scroll;
              position: relative;
            }

            #outline-container {
              transition: left 0.5s;
              position: absolute;
              left: ${docPos};
              background: white;
              width: ${documentWidth}px;
              min-height: 971px !important;
              height: auto !important;
              margin: 0px 20px;
              border: none;
              border-radius: 0px;
              box-shadow: 3px 3px 9px 0px rgb(0 0 0 / 38%) !important;
              outline: none !important;
              resize: none;
            }


            [text-analysis='true'] {
              transition: background-color 0.25s;
            }

            .ta-success[text-analysis='true'] {
              background-color: rgba(2, 112, 255, 0.2);
            }

            .ta-success[text-analysis='true'].hover {
              background-color: rgba(2, 78, 255, 0.6);
            }

            .ta-comment[text-analysis='true'] {
              background-color: rgba(150, 150, 150, 0.2);
            }

            .ta-comment[text-analysis='true'].hover {
              background-color: rgba(150, 150, 150, 0.4);
            }

            .ta-warning[text-analysis='true'] {
              background-color: rgba(255, 210, 10, 0.3);
            }

            .ta-warning[text-analysis='true'].hover {
              background-color: rgba(255, 210, 10, 0.6);
            }

            .ta-danger[text-analysis='true'] {
              background-color: rgba(255, 59, 10, 0.3);
            }

            .ta-danger[text-analysis='true'].hover {
              background-color: rgba(255, 59, 10, 0.6);
            }
            
            body {
              overflow: hidden !important;
            }

            #annotations-header-label {
              padding: 12px 0px 0px 20px;
            }

            #document-container {
              height: calc(100vh - ${200}px);
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
              min-height: 971px;
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

            #comment-card-left-pointer, #comment-card-middle-pointer, #comment-card-right-pointer {
              display: none;
            }

            .left #comment-card-left-pointer, .middle #comment-card-middle-pointer, .right #comment-card-right-pointer {
              display: block !important;
            }
        `}
      </style>
    </>
  );
};

export default ISOutline;
