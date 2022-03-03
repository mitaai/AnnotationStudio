/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useEffect,
  useState,
} from 'react';
import {
  Button,
  OverlayTrigger,
  Popover,
  Card,
  Navbar,
  Container,
  Nav,
} from 'react-bootstrap';

import {
  X,
} from 'react-bootstrap-icons';
import { DeepCopyObj } from '../../utils/docUIUtils';
import { getDocumentsByGroupByUser, getDocumentTextAnalyses } from '../../utils/docUtil';
import { findNGrams, getNGramTexts } from '../../utils/nGramUtil';
import { createDocumentBody } from '../../utils/outlineUtil';
import LoadingSpinner from '../LoadingSpinner';
import AddDocumentCard from '../RunUserTextAnalysisModal/AddDocumentCard';
import DocumentCard from '../RunUserTextAnalysisModal/DocumentCard';
import SearchDocumentsUI from '../RunUserTextAnalysisModal/SearchDocumentsUI';
import TileBadge from '../TileBadge';

import styles from './SourceTextAnalysisButton.module.scss';


function SourceTextAnalysisButton({ exit = () => {}, session, convertAnnotationTilesToImages }) {
  const [tab, setTab] = useState('source-texts');
  const [exitHover, setExitHover] = useState();

  const [sourceTextsOpen, setSourceTextsOpen] = useState(true);
  const [showSearchDocumentsUI, setShowSearchDocumentsUI] = useState();
  const [selectedDocuments, setSelectedDocuments] = useState({});
  const [documentAnalyses, setDocumentAnalyses] = useState();
  const [addedDetectedDocuments, setAddedDetectedDocuments] = useState();
  const [orderOfSelectedDocuments, setOrderOfSelectedDocuments] = useState([]);
  const [loadingResults, setLoadingResults] = useState();
  const [textAnalysis, setTextAnalysis] = useState();
  const [results, setResults] = useState();
  const [documents, setDocuments] = useState();
  const [detectedDocumentIds, setDetectedDocumentIds] = useState();
  const [alerts, setAlerts] = useState([]);

  const cardWidth = 110;
  const cardHeight = 165;

  const analysisState = 'default';

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

  // eslint-disable-next-line no-unused-vars
  const generateTempDocument = ({ callback: callbackFunc }) => {
    const callback = ({ composition, documentIds }) => {
      callbackFunc({
        tempDocument: createDocumentBody(
          { composition: { document: composition, name: 'temporary-document' } },
        ),
        documentIds,
      });
    };

    convertAnnotationTilesToImages({ callback });
  };


  const sourceTextsContent = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', flexDirection: 'row', padding: '15px 3px 15px 15px', alignItems: 'center',
      }}
      >
        <div className={styles.sourceTextContainer}>
          <div
            className={styles.sourceTextHeader}
          >
            Input source texts used in your composition
          </div>
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
    </div>
  );


  const tabs = {
    loading: <LoadingSpinner />,
    'source-texts': sourceTextsContent,
    results: <div>Results</div>,
    features: <div>features</div>,
  };

  const navLinePos = {
    'source-texts': 0,
    results: 33,
    features: 66,
  };

  const filterPopoverComponent = (
    <Popover className={styles.sourceTextAnalysisPopover} id="filter-popover">
      <Popover.Content>
        <Card>
          <Card.Body style={{ padding: 0 }}>
            <Navbar bg="light" variant="light" style={{ borderRadius: '4px 4px 0px 0px' }}>
              <Container style={{ display: 'flex', position: 'relative' }}>
                <Nav className="me-auto text-analysis-navbar">
                  <Nav.Link onClick={() => setTab('source-texts')} active={tab === 'source-texts'}>Source Texts</Nav.Link>
                  <Nav.Link onClick={() => setTab('results')} active={tab === 'results'}>Results</Nav.Link>
                  <Nav.Link onClick={() => setTab('features')} active={tab === 'features'}>Features</Nav.Link>
                </Nav>
                <div className={styles.navLine} style={{ left: `${navLinePos[tab]}%` }} />
              </Container>
            </Navbar>
            <div style={{ padding: '0px 10px' }}>
              {tabs[tab]}
            </div>
          </Card.Body>
        </Card>
      </Popover.Content>
    </Popover>
  );

  /*
  useEffect(() => {
    if (!document?.text) {
      generateTempDocument({
        callback: ({ documentIds }) => {
          setDetectedDocumentIds(documentIds);
        },
      });
    }
  }, []);
  */

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
      // updateDocumentContainerWidth();
    });

    // updateDocumentContainerWidth();

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
      <OverlayTrigger
        trigger="click"
        key="source-text-analysis-button"
        placement="bottom"
        overlay={filterPopoverComponent}
        defaultShow
        rootClose
      >
        <Button id="source-text-analysis-button" size="sm" variant={exitHover ? 'danger' : 'primary'}>
          <span style={{ marginRight: 4 }}>Source Text Analysis</span>
          <X
            size={16}
            onMouseEnter={() => setExitHover(true)}
            onMouseLeave={() => setExitHover()}
            onClick={exit}
          />
        </Button>
      </OverlayTrigger>

      <style jsx global>
        {`
            #source-text-analysis-button {
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .text-analysis-navbar {
                flex: 1;
                display: flex;
                flex-direction: row;
                justify-content: center;
            }
  
            .text-analysis-navbar .nav-link.active {
              color: #015999 !important;
            }

            .text-analysis-navbar .nav-link {
                flex: 1;
                padding-left: 0px;
                padding-right: 0px;
                text-align: center;
                font-weight: bold;
            }
    
            #btn-text-analysis-filter .badge {
              opacity: 0.0;
              transition: opacity 0.25s;
              position: relative;
              top: -2px !important;
            }
            #btn-text-analysis-filter .badge.active {
              opacity: 1.0;
            }
            
            #btn-text-analysis-filter {
              margin-left: 5px;
              margin-top: 7px;
              float: right;
              text-overflow: ellipsis;
              overflow: hidden;
              white-space: nowrap;
            }
    
            #btn-text-analysis-filter svg {
              position: relative;
              top: -1px;
            }
    
            #filter-popover {
              min-width: 600px;
              width: 600px;
              left: 50px !important;
            }

            #filter-popover .popover-body {
                padding: 0px;
            }
    
            #filter-popover .card {
              border: none;
            }

            #filter-popover .arrow {
                left: -55px !important;
            }

            #filter-popover .arrow::after {
                border-bottom-color: #f8f9fa;
            }
    
            #filter-popover .form-label {
              font-weight: bold;
            }
    
            #filter-popover .filter-option-checkbox {
              margin-right: 4px;
            }
    
            #filter-popover .filter-option-name {
              position: relative;
              top: -2px;
              font-size: 14px;
            }
    
            #filter-popover .rbt-input-multi.form-control.rbt-input {
              padding: 6px;
            }
    
            .token-badge {
                position: relative;
                top: -1px;
                margin-left: 4px;
                font-size: 10px;
                border-radius: 5px;
                padding: 1px 2px;
            }
    
            .rbt-token-active .token-badge {
                border-color: white;
            }
    
            .no-matches-token {
                background-color: #eeeeee !important;
                color: #616161 !important;
            }
    
            .no-matches-token .token-badge {
                border-color: #616161 !important; 
            }
            
            `}
      </style>
    </>
  );
}

export default SourceTextAnalysisButton;

