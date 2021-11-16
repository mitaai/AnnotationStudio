/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import {
  ProgressBar, Modal,
} from 'react-bootstrap';
import { getDocumentTextAnalysis } from '../../utils/docUtil';

export default function RunTextAnalysisModal({
  setAlerts,
  show,
  setShow = () => {},
  setTextAnalysisData,
  textAnalysisComplete,
  setTextAnalysisComplete,
  getHTMLValue,
  documentTextAnalysisId,
  setDocumentTextAnalysisId,
}) {

  const [errorMessage, setErrorMessage] = useState();

  const onHide = errorMessage ? () => setShow() : () => {};
  const body = errorMessage
    ? (
      <div>
        <div style={{ fontSize: 16, fontWeight: 'bold', color: '#e53935' }}>An error occurred while running text analysis:</div>
        <div style={{ fontSize: 14 }}>{errorMessage}</div>
      </div>
    )
    : <ProgressBar animated now={100} />;

  const analyzeText = async () => {
    const document = {
      content: getHTMLValue(),
      type: 'HTML',
    };

    const returnData = setTextAnalysisData !== undefined;
    getDocumentTextAnalysis({ document, analysisId: documentTextAnalysisId, returnData })
      .then((res) => {
        if (res.err) {
          setErrorMessage(res.err.details);
          setDocumentTextAnalysisId();
          setTextAnalysisComplete();
        } else {
          setErrorMessage();
          if (returnData) {
            setTextAnalysisData(res.analysis.result);
          }
          setDocumentTextAnalysisId(res.analysis.id);
          setTextAnalysisComplete(true);
          setShow();
        }
      })
      .catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      });
  };

  useEffect(() => {
    if (show && !textAnalysisComplete) {
      analyzeText();
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton={errorMessage}>
        <Modal.Title>Running Text Analysis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {body}
      </Modal.Body>
    </Modal>
  );
}
