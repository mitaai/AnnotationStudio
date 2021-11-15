/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';

import {
  ProgressBar, Modal,
} from 'react-bootstrap';
import { getDocumentTextAnalysis } from '../../utils/docUtil';

export default function RunTextAnalysisModal({
  show,
  setShow = () => {},
  textAnalysisComplete,
  setTextAnalysisComplete,
  getHTMLValue,
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

    getDocumentTextAnalysis({ document })
      .then((res) => {
        console.log('res', res);
        if (res.err) {
          setErrorMessage(res.err.details);
          setDocumentTextAnalysisId();
          setTextAnalysisComplete();
        } else {
          setDocumentTextAnalysisId(res.analysis.id);
          setTextAnalysisComplete(true);
          setShow();
        }
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  useEffect(() => {
    if (show && !textAnalysisComplete) {
      analyzeText();
    }
  }, [show]);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Running Text Analysis</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {body}
      </Modal.Body>
    </Modal>
  );
}
