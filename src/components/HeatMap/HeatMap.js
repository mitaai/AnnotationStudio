/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React, { useState, useContext, useEffect } from 'react';
import $ from 'jquery';

import { DocumentFiltersContext, DocumentAnnotationsContext } from '../../contexts/DocumentContext';


const HeatMap = ({ pdf, documentZoom }) => {
  const [documentHeight, setDocumentHeight] = useState(undefined);
  const [documentScrollHeight, setDocumentScrollHeight] = useState(undefined);
  const lineHeight = 18;

  if (documentScrollHeight !== undefined) {
    const h = documentZoom < 100
      ? documentScrollHeight * (documentZoom / 100)
      : documentScrollHeight;
    $('#document-container-col').height(h);
  }

  useEffect(() => {
    if ($('#document-container').get(0) !== undefined && documentHeight === undefined && documentScrollHeight === undefined) {
      setDocumentHeight($('#document-container').height());
      setDocumentScrollHeight($('#document-container').get(0).scrollHeight / (documentZoom / 100));
    }
  }, [documentZoom]);

  const scaleFactor = (
    documentHeight !== undefined
    && documentScrollHeight !== undefined
    && documentScrollHeight !== 0
  )
    ? (documentHeight / documentScrollHeight)
    : 1;
  const minStrokeHeight = 1;
  const offsetTop = $('#document-container').offset() === undefined
    ? 0
    : $('#document-container').offset().top;
  const granularity = lineHeight * scaleFactor >= minStrokeHeight
    ? lineHeight
    : Math.ceil(minStrokeHeight / scaleFactor);
  const [channelAnnotations] = useContext(DocumentAnnotationsContext);
  const [documentFilters] = useContext(DocumentFiltersContext);
  const n = (
    documentScrollHeight !== undefined
    && granularity !== undefined
  )
    ? Math.ceil(documentScrollHeight / granularity)
    : 0;
  const map = new Array(n);

  for (const side in channelAnnotations) {
    if (channelAnnotations[side] !== null) {
      for (const anno of channelAnnotations[side]) {
        if (documentFilters.annotationIds[side] !== null
          && documentFilters.annotationIds[side].includes(anno._id)) {
          if (anno.position.height !== undefined) {
            let h = anno.position.height;
            // if for some reason the height of this annotation is a negative number,
            // recalculate the value in the loop
            if (h < 0) {
              const annotationBeginning = $(
                `#document-content-container span[annotation-id='${anno._id}'] .annotation-beginning-marker`,
              );
              const annotationEnding = $(
                `#document-content-container span[annotation-id='${anno._id}'] .annotation-ending-marker`,
              );
              if (annotationBeginning.get(0) !== undefined
                && annotationEnding.get(0) !== undefined) {
                const annotationBeginningPosition = annotationBeginning.offset();
                const annotationEndingPosition = annotationEnding.offset();
                h = (annotationEndingPosition.top - annotationBeginningPosition.top) + lineHeight;
              } else {
                h = 0;
              }
            }
            // convert the annotation position and height
            // into starting and ending indexs for the map
            let startIndex = Math.floor(
              (anno.position.top - offsetTop) / granularity,
            );
            startIndex = startIndex < 0 ? 0 : startIndex;
            const endIndex = Math.floor(
              ((anno.position.top + h) - offsetTop) / granularity,
            );
            for (let i = startIndex; i <= endIndex; i += 1) {
              if (i < n) {
                if (map[i] === undefined) {
                  map[i] = 0;
                }
                map[i] += 1;
              }
            }
          }
        }
      }
    }
  }

  return (
    <>
      <div
        id="heat-map"
        data-testid="heat-map"
        style={{ height: (documentHeight === undefined ? 0 : documentHeight) + (pdf ? 0 : 18) }}
      >
        {map.map((v, i) => (
          <div
            className="stroke"
            style={{
              height: lineHeight * scaleFactor,
              top: i * lineHeight * scaleFactor,
              opacity: v * 0.5,
            }}
          />
        ))}
      </div>

      <style jsx global>
        {`
        
        #heat-map {
          background: #c4c4c4;
          position: absolute;
          right: 3px;
          width: 8px;
          border-radius: 8px;
          z-index: -1;
          right: 2px;
        }

        #heat-map .stroke {
          position: absolute;
          background: rgb(255, 255, 10);
          width: 100%;
        }
        
        `}
      </style>
    </>
  );
};

export default HeatMap;
