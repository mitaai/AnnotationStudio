import React from 'react';
import styles from './TextAnalysisInfo.module.scss';

function TextAnalysisInfo({ textAnalysisColor, featuresIcon }) {
  return (
    <>
      <div>
        <div style={{ color: '#212121', fontSize: 15, marginTop: 5 }}>
          Powered by&nbsp;
          <strong>Google Cloud</strong>
          , Annotation Studio&apos;s Text Analysis software generates extra layers of
          information and annotation to help readers understand and deep read a writing.
        </div>
        <div style={{ paddingLeft: 10 }}>
          <div style={{
            color: '#212121', fontSize: 17, fontWeight: 'bold', marginTop: 5,
          }}
          >
            Features
          </div>
          <div style={{ marginTop: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {featuresIcon}
              <span
                style={{ color: textAnalysisColor }}
                className={styles.featureHeader}
              >
                Named Entity Recoginition
              </span>
            </div>
            <div className={styles.featureText}>
              Highlights and labels people, places,and events in a document and
              organizes them by relevance and frequency within the document.
            </div>
          </div>
          <div style={{ marginTop: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {featuresIcon}
              <span
                style={{ color: textAnalysisColor }}
                className={styles.featureHeader}
              >
                Sentiment Analysis
              </span>
            </div>
            <div className={styles.featureText}>
              Highlights and labels people, places,
              and events in a document and organizes them by relevance and frequency
              within the document.
            </div>
          </div>
          <div style={{ marginTop: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {featuresIcon}
              <span
                style={{ color: textAnalysisColor }}
                className={styles.featureHeader}
              >
                Literary Device Analysis
              </span>
            </div>
            <div className={styles.featureText}>
              Scans, highlights, and labels literary devices found in a document, for
              example: metaphor, simile, rhetorical devices, etc.
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TextAnalysisInfo;
