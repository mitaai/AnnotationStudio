/* eslint-disable no-underscore-dangle */
import React, { useContext, useState } from 'react';
import RangeSlider from 'react-bootstrap-range-slider';
import {
  Button,
} from 'react-bootstrap';
import {
  ZoomIn,
} from 'react-bootstrap-icons';
import { DocumentContext } from '../../contexts/DocumentContext';

function DocumentZoomSlider({
  documentZoom, setDocumentZoom, style = {}, min = 50, max = 200,
}) {
  const [hovered, setHovered] = useState();
  const widthOfSlider = 100;
  const widthOfCollapsedZoomContainer = 92;
  const textColor = hovered ? 'text-secondary' : 'text-secondary';
  // const colorOfSliderText = hovered ? '#007bff' : '#616161';
  return (
    <>
      <Button
        className="btn-document-zoom"
        style={{
          width: hovered
            ? widthOfCollapsedZoomContainer + widthOfSlider
            : widthOfCollapsedZoomContainer,
          ...style,
        }}
        variant="outline-light"
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered()}
      >
        <div style={{
          display: 'flex', margin: 'auto',
        }}
        >
          <ZoomIn style={{ marginRight: 5, fontSize: 16 }} className={textColor} />
        </div>
        <div
          style={{
            display: 'flex', margin: 'auto',
          }}
          className={textColor}
        >
          <span style={{ width: 30, textAlign: 'center' }}>{documentZoom}</span>
          <span>%</span>
        </div>
        <div className="rangeSlider-container" style={{ width: hovered ? widthOfSlider : 0 }}>
          <div style={{
            minWidth: widthOfSlider, paddingLeft: 7, paddingRight: 3, height: 60,
          }}
          >
            <RangeSlider
              variant="primary"
              tooltip="off"
              size="sm"
              min={min}
              max={max}
              value={documentZoom}
              onChange={
                (changeEvent) => {
                  setDocumentZoom(parseInt(changeEvent.target.value, 10));
                }
              }
            />
          </div>
        </div>
      </Button>
      <style jsx global>
        {`
          .btn-document-zoom {
            transition: width 0.5s;
            border: ${style.border ? style.border : '1px solid #eeeeee'} !important;
            padding-top: 0px !important;
            padding-bottom: 0px !important;
            display: flex;
            flex-direction: row;
            height: 32px;
          }
          
          .rangeSlider-container {
            transition: width 0.5s;
            display: flex;
            overflow: hidden !important;
          }
          `}
      </style>
    </>
  );
}

function DocumentZoomSliderWithContext({ min, max, style }) {
  const [, documentZoom, setDocumentZoom] = useContext(DocumentContext);
  return (
    <DocumentZoomSlider
      documentZoom={documentZoom}
      setDocumentZoom={setDocumentZoom}
      style={style}
      min={min}
      max={max}
    />
  );
}

function DocumentZoomSliderContainer({
  stateful, documentZoom, setDocumentZoom, style, min, max,
}) {
  return stateful
    ? (
      <DocumentZoomSlider
        documentZoom={documentZoom}
        setDocumentZoom={setDocumentZoom}
        style={style}
        min={min}
        max={max}
      />
    )
    : <DocumentZoomSliderWithContext min={min} max={max} />;
}

export default DocumentZoomSliderContainer;
