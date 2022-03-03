/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import $ from 'jquery';
import {
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap';
import {
  ChevronUp, InfoCircleFill,
} from 'react-bootstrap-icons';
import { DeepCopyObj } from '../../utils/docUIUtils';
import DocumentViewContainer from '../DocumentViewContainer/DocumentViewContainer';
import DocumentZoomSlider from '../DocumentZoomSlider';
import { getNGramTexts, findNGrams } from '../../utils/nGramUtil';
import { getDocumentsByGroupByUser, getDocumentTextAnalysis, getDocumentTextAnalyses } from '../../utils/docUtil';
import styles from './RunUserTextAnalysisModal.module.scss';
import DocumentCard from './DocumentCard';
import AddDocumentCard from './AddDocumentCard';
import SearchDocumentsUI from './SearchDocumentsUI';
import TileBadge from '../TileBadge';


function RunUserTextAnalysisModal({
  generateTempDocument, show, setShow, session, saveResults,
}) {
  const focusedAnnotationsRef = useRef({ left: null, right: null }).current;
  const [loadingTextAnalysis, setLoadingTextAnalysis] = useState(true);
  const [sourceTextsOpen, setSourceTextsOpen] = useState(true);
  const [showSearchDocumentsUI, setShowSearchDocumentsUI] = useState();
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [documentAnalyses, setDocumentAnalyses] = useState();
  const [orderOfSelectedDocuments, setOrderOfSelectedDocuments] = useState([]);
  const [loadingResults, setLoadingResults] = useState();
  const [textAnalysis, setTextAnalysis] = useState();
  const [documentZoom, setDocumentZoom] = useState(100);
  const [results, setResults] = useState();
  const [documents, setDocuments] = useState();
  const [addedDetectedDocuments, setAddedDetectedDocuments] = useState();
  const [detectedDocumentIds, setDetectedDocumentIds] = useState();
  const [document, setDocument] = useState({});
  const [documentContainerWidth, setDocumentContainerWidth] = useState();
  const [annotationChannel1Loaded, setAnnotationChannel1Loaded] = useState();
  const [annotationChannel2Loaded, setAnnotationChannel2Loaded] = useState();
  const [alerts, setAlerts] = useState([]);
  const [documentHighlightedAndLoaded, setDocumentHighlightedAndLoaded] = useState(false);
  const [annotationIdBeingEdited, setAnnotationIdBeingEdited] = useState();
  const [showUnsavedChangesToast, setShowUnsavedChangesToast] = useState();
  const [showMaxTextLengthReached, setShowMaxTextLengthReached] = useState();
  const [activeAnnotations, setActiveAnnotations] = useState({ annotations: [], target: null });
  const [channelAnnotations, setChannelAnnotations] = useState({ left: [], right: [] });
  const [expandedAnnotations, setExpandedAnnotations] = useState([]);
  const [membersIntersection, setMembersIntersection] = useState([]);
  const displayAnnotationsInChannels = true;
  const [extraWidth, setExtraWidth] = useState(0);
  const extraMarginGrowthFactor = 3.5;
  const extraMargin = (documentZoom - 100) * extraMarginGrowthFactor;
  const minDisplayWidth = 0;
  const documentWidth = 750;
  const minChannelWidth = (1400 - documentWidth) / 2;
  const minHeaderHeight = 121;
  const headerHeight = minHeaderHeight;
  const footerHeight = 0;
  const documentIsPDF = false;

  const cardWidth = 110;
  const cardHeight = 165;

  const fetchDocumentsTextAnalyses = () => {
    const analysisIdToDocId = {};
    const analysisIds = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [id, { textAnalysisId }] of Object.entries(selectedDocuments)) {
      if (textAnalysisId) {
        analysisIdToDocId[textAnalysisId] = id;
        analysisIds.push(textAnalysisId);
      }
    }

    getDocumentTextAnalyses({ analysisIds })
      .then((res) => {
        // console.log('res', res);
        if (res.err) {
          console.log('err', res.err);
          // setErrorMessage(res.err.details);
          // setDocumentTextAnalysisId();
          // setTextAnalysisComplete();
          setLoadingResults();
        } else if (res.analyses) {
          const newDocumentAnalyses = {};
          const sourceTextsData = [];
          // eslint-disable-next-line no-restricted-syntax
          for (const { analysis, _id } of res.analyses) {
            // eslint-disable-next-line no-underscore-dangle
            newDocumentAnalyses[_id] = { ...analysis, documentId: analysisIdToDocId[_id] };
            sourceTextsData.push({
              slug: _id,
              text: analysis.processedTokens || [],
            });
          }

          const fng = findNGrams({
            size: 3,
            sourceTexts: sourceTextsData,
            text: textAnalysis.processedTokens,
          });

          console.log('fng', fng);

          const res2 = getNGramTexts({
            userTextAnalysisData: textAnalysis,
            sourceTextsData: fng.sourceTextsData,
            size: 3,
          });

          setResults(res2);
          setDocumentAnalyses(newDocumentAnalyses);
          setLoadingResults();
        }
      })
      .catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        setLoadingResults();
      });
  };

  const numberOfSelectedDocuments = Object.keys(selectedDocuments).length;

  const addDocumentToSelectedDocuments = (doc) => {
    const newSelectedDocuments = DeepCopyObj(selectedDocuments);
    // eslint-disable-next-line no-underscore-dangle
    newSelectedDocuments[doc._id] = doc;
    const newOrderOfSelectedDocuments = orderOfSelectedDocuments.slice();
    // eslint-disable-next-line no-underscore-dangle
    newOrderOfSelectedDocuments.push(doc._id);
    setSelectedDocuments(newSelectedDocuments);
    setOrderOfSelectedDocuments(newOrderOfSelectedDocuments);
  };

  const deleteDocumentFromSelectedDocuments = (id) => {
    const newSelectedDocuments = DeepCopyObj(selectedDocuments);
    delete newSelectedDocuments[id];
    const newOrderOfSelectedDocuments = orderOfSelectedDocuments.filter((docId) => docId !== id);
    setSelectedDocuments(newSelectedDocuments);
    setOrderOfSelectedDocuments(newOrderOfSelectedDocuments);
  };

  const cards = orderOfSelectedDocuments.map(
    (id) => (
      <DocumentCard
        title={selectedDocuments[id]?.title}
        author={selectedDocuments[id]?.author}
        width={cardWidth}
        height={cardHeight}
        onDelete={() => deleteDocumentFromSelectedDocuments(id)}
      />
    ),
  );
  const addDocumentCard = (
    <AddDocumentCard
      width={cardWidth}
      height={cardHeight}
      onClick={() => setShowSearchDocumentsUI(true)}
    />
  );

  let analysisState = 'default';
  let resultContent;
  if (loadingResults) {
    analysisState = 'loading';
    resultContent = (
      <div style={{
        alignItems: 'center', justifyContent: 'center', display: 'flex', flex: 1, flexDirection: 'column', paddingBottom: 60,
      }}
      >
        <div style={{ color: '#bdbdbd', marginBottom: 5 }}>Running Analysis...</div>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  } else if (documentAnalyses) {
    analysisState = 'completed';
    // pass
  } else {
    resultContent = (
      <div style={{
        alignItems: 'center', justifyContent: 'center', display: 'flex', flex: 1, flexDirection: 'column', paddingBottom: 90,
      }}
      >
        <div style={{ color: '#bdbdbd', marginBottom: 5 }}>No results</div>
      </div>
    );
  }

  const tileBadgeData = {
    default: {
      color: 'dark-blue',
      text: 'Run Analysis',
      onClick: true,
    },
    loading: {
      color: 'grey',
      text: 'Running Analysis...',
      onClick: false,
    },
    completed: {
      color: 'green',
      text: 'Analysis Completed',
      onClick: false,
    },
  };

  const textAnalysisContent = textAnalysis && (
  <div style={{ display: 'flex', flexDirection: 'column', width: `calc(33.33vw - ${50 / 3}px` }}>
    <div style={{
      display: 'flex', flexDirection: 'row', padding: '15px', alignItems: 'center',
    }}
    >
      <div className={styles.sourceTextContainer}>
        <div
          className={styles.sourceTextHeader}
          onClick={() => setSourceTextsOpen(!sourceTextsOpen)}
        >
          Source Texts
        </div>
        <ChevronUp
          className={styles.sourceTextChevron}
          size={16}
          style={{
            transform: `rotate(${sourceTextsOpen ? 0 : 180}deg)`,
          }}
          onClick={() => setSourceTextsOpen(!sourceTextsOpen)}
        />
      </div>

      <div style={{ flex: 1 }} />
      <TileBadge
        key="text-analysis-status"
        color={numberOfSelectedDocuments === 0 ? 'grey' : tileBadgeData[analysisState].color}
        text={tileBadgeData[analysisState].text}
        fontSize={12}
        paddingLeft={8}
        paddingRight={8}
        paddingTop={6}
        paddingBottom={6}
        onClick={numberOfSelectedDocuments > 0 && tileBadgeData[analysisState].onClick
          ? () => {
            setLoadingResults(true);
            setSourceTextsOpen();
            fetchDocumentsTextAnalyses();
          }
          : undefined}
      />
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '0px 15px',
      transition: 'height 0.25s',
      height: sourceTextsOpen ? 230 : 0,
      overflowX: 'hidden',
    }}
    >
      <div style={{
        color: '#bdbdbd', fontSize: 14, marginLeft: 2, marginBottom: 15, marginTop: -5,
      }}
      >
        Input source texts referenced  in composition
      </div>
      {showSearchDocumentsUI
        ? (
          <SearchDocumentsUI
            documents={documents}
            selectedDocuments={selectedDocuments}
            onSelect={addDocumentToSelectedDocuments}
            onDone={() => setShowSearchDocumentsUI()}
          />
        ) : (
          <>
            <div style={{
              display: 'flex', flexDirection: 'row', padding: 5, overflowX: 'scroll', width: '100%',
            }}
            >
              {[addDocumentCard].concat(cards)}
            </div>
          </>
        )}
    </div>
    <div style={{
      width: `calc(100% - ${sourceTextsOpen ? 120 : 40}px)`,
      transition: 'width 0.25s',
      height: 1,
      backgroundColor: '#eeeeee',
      margin: '0px auto',
    }}
    />
    <div style={{
      display: 'flex', flex: 1, flexDirection: 'column', padding: '15px',
    }}
    >
      <div style={{ fontSize: 22, fontWeight: 'bold' }}>Results</div>
      {resultContent}
    </div>
  </div>
  );

  const updateDocumentContainerWidth = () => {
    if ($('#left-panel').get(0)) {
      setDocumentContainerWidth($('#left-panel').get(0).getBoundingClientRect().width);
    }
  };

  useEffect(() => {
    if (results) {
      saveResults({ sourceTexts: selectedDocuments, analysis: results });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  useEffect(() => {
    if (show && !document?.text) {
      generateTempDocument({
        callback: ({ tempDocument, documentIds }) => {
          setDocument(tempDocument);
          setDetectedDocumentIds(documentIds);
        },
      });
    }
  }, [show]);

  useEffect(() => {
    updateDocumentContainerWidth();
  }, [documentZoom]);

  useEffect(() => {
    /* debouncedRepositioning(
      channelAnnotations,
      setChannelAnnotations,
    ); */
    // eslint-disable-next-line no-undef
    const channelWidth = (window.innerWidth - documentWidth - (2 * extraMargin)) / 2;
    setExtraWidth(channelWidth < minChannelWidth ? (minChannelWidth - channelWidth) * 2 : 0);
    if ($('#document-container').get(0) !== undefined) {
      const {
        scrollHeight, offsetHeight, scrollTop,
      } = $('#document-container').get(0);
      // calculateHeaderAndFooterHeight(scrollHeight <= offsetHeight + scrollTop);
    }
  }, [documentZoom]);

  /* useEffect(() => {
    if (!initializedXScollPosition
        && session
        && !loading
        && document
        && !documentLoading
        && $('#document-container').get(0) !== undefined
      ) {
      const { scrollWidth, offsetWidth } = $('#document-container').get(0);
      if (scrollWidth > offsetWidth) {
        $('#document-container').scrollLeft((scrollWidth - offsetWidth) / 2);
        setInitializedXScollPosition(true);
      }
    }
  }, [extraWidth]);
  */

  useEffect(() => {
    // document has not been loaded in yet
    if (!document?.text) {
      return;
    }

    const doc = {
      content: document.text,
      type: 'HTML',
    };

    getDocumentTextAnalysis({
      document: doc,
      returnData: true,
      dontSaveData: true,
    })
      .then((res) => {
        if (res.err) {
          console.log('err', res.err);
          // setErrorMessage(res.err.details);
          // setDocumentTextAnalysisId();
          // setTextAnalysisComplete();
        } else {
          setTextAnalysis(res.analysis.result);
          setLoadingTextAnalysis();
        }
      })
      .catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      });
  }, [document]);

  useEffect(() => {
    if (documents && detectedDocumentIds && !addedDetectedDocuments) {
      // this means that we have documents to look through and detected documents to find
      const newSelectedDocuments = DeepCopyObj(selectedDocuments);
      const newOrderOfSelectedDocuments = orderOfSelectedDocuments.slice();

      // eslint-disable-next-line no-restricted-syntax
      for (const doc of documents) {
        // eslint-disable-next-line no-underscore-dangle
        if (detectedDocumentIds[doc._id]) {
          const { contributors } = doc;
          const contributor = contributors.find(({ type }) => type === 'Author');
          const author = contributor?.name || 'Unknown';
          // eslint-disable-next-line no-underscore-dangle
          newSelectedDocuments[doc._id] = { ...doc, author };
          // eslint-disable-next-line no-underscore-dangle
          newOrderOfSelectedDocuments.push(doc._id);
        }
      }

      setSelectedDocuments(newSelectedDocuments);
      setOrderOfSelectedDocuments(newOrderOfSelectedDocuments);
      setAddedDetectedDocuments(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedDocumentIds, documents]);

  useEffect(() => {
    // eslint-disable-next-line no-undef
    window.addEventListener('resize', () => {
      updateDocumentContainerWidth();
    });

    updateDocumentContainerWidth();

    getDocumentsByGroupByUser({
      groups: session.user.groups,
      id: session.user.id,
      noDrafts: true,
    })
      .then(async (data) => {
        const { docs } = data;
        getDocumentsByGroupByUser({
          groups: [],
          id: session.user.id,
          mine: true,
          noDrafts: true,
        })
          .then(async (personalData) => {
            const { docs: personalDocs } = personalData;
            const sortedDocuments = docs.concat(personalDocs).sort((a, b) => {
              if (a.title.toLowerCase() < b.title.toLowerCase()) {
                return -1;
              }
              if (a.title.toLowerCase() === b.title.toLowerCase()) {
                if (a.title < b.title) {
                  return -1;
                }
                return 0;
              }
              return 1;
            });

            setDocuments(sortedDocuments);
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
          });
      })
      .catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      });
  }, []);

  return (
    <>
      <Modal id="runAnalysisModal" style={{ width: '100%' }} show={show} onHide={() => setShow()}>
        <Modal.Body style={{ padding: 0, display: 'flex', flexDirection: 'row' }}>
          <div
            id="left-panel"
            style={{
              display: 'flex', flexDirection: 'column', flex: 2, backgroundColor: '#f5f5f5', position: 'relative',
            }}
          >
            <div style={{
              backgroundColor: 'white', padding: '15px 15px 15px 25px', display: 'flex', alignItems: 'center',
            }}
            >
              <span style={{ fontSize: 20, fontWeight: 'bold', color: '#212121' }}>Idea Space</span>
              <span style={{
                height: 25, width: 1, backgroundColor: '#9e9e9e', marginRight: 7, marginLeft: 7,
              }}
              />
              <span className={styles.analysisModeContainer} style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 16, marginRight: 4 }}>Analysis Mode</span>
                <InfoCircleFill size={15} />
              </span>
              <span style={{ flex: 1 }} />
              <DocumentZoomSlider
                stateful
                documentZoom={documentZoom}
                setDocumentZoom={setDocumentZoom}
              />
            </div>
            <div style={{ height: 1, backgroundColor: '#e0e0e0' }} />
            <DocumentViewContainer
              annotationChanelsStateful
              displayAnnotationsInChannels={displayAnnotationsInChannels}
              deleteAnnotationFromChannels={() => {}}
              setAnnotationChannel1Loaded={setAnnotationChannel1Loaded}
              moveAnnotationsToCorrectSpotBasedOnFocus={() => {}}
              focusedAnnotationsRef={focusedAnnotationsRef}
              channelAnnotations={channelAnnotations}
              session={session}
              showMoreInfoShareModal={false}
              setShowMoreInfoShareModal={() => {}}
              setShowMaxedAnnotationLengthToast={() => {}}
              membersIntersection={membersIntersection}
              alerts={alerts}
              setAlerts={setAlerts}
              documentWidth={documentWidth}
              extraMargin={extraMargin}
              setShowUnsavedChangesToast={setShowUnsavedChangesToast}
              setShowMaxTextLengthReached={setShowMaxTextLengthReached}
              annotationIdBeingEdited={annotationIdBeingEdited}
              addActiveAnnotation={() => {}}
              removeActiveAnnotation={() => {}}
              setChannelAnnotations={setChannelAnnotations}
              setDocumentHighlightedAndLoaded={setDocumentHighlightedAndLoaded}
              annotations={[]}
              documentHighlightedAndLoaded={documentHighlightedAndLoaded}
              addAnnotationToChannels={() => {}}
              highlightTextToAnnotate={() => {}}
              document={document}
              showCannotAnnotateDocumentToast={false}
              setShowCannotAnnotateDocumentToast={() => {}}
              setAnnotationChannel2Loaded={setAnnotationChannel2Loaded}
              documentZoom={documentZoom}
            />
          </div>
          <div style={{ width: 1, backgroundColor: '#eeeeee' }} />
          <div
            style={{
              display: 'flex',
              flex: 1,
              flexDirection: 'row',
              boxShadow: '0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%)',
            }}
          >
            {loadingTextAnalysis && (
            <div style={{
              alignItems: 'center', justifyContent: 'center', display: 'flex', flex: 1, flexDirection: 'column', paddingBottom: 20,
            }}
            >
              <div style={{ color: '#bdbdbd', marginBottom: 5 }}>Loading Text Analysis</div>
              <Spinner animation="border" variant="primary" />
            </div>
            )}
            {textAnalysisContent}
          </div>
        </Modal.Body>
      </Modal>
      <style jsx global>
        {`

    body {
      overflow: hidden !important;
    }

    #annotations-header-label {
      padding: 12px 0px 0px 20px;
    }

    #document-container {
      width: ${documentContainerWidth ? (`${documentContainerWidth}px`) : '100%'};
      height: calc(100vh - 125px);
      transition: height 0.5s;
      overflow-y: overlay !important;
      overflow-x: scroll !important;
      padding: 25px 0px 0px 0px;
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
    
  `}
      </style>
    </>
  );
}

export default RunUserTextAnalysisModal;

