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

function DocumentZoomSlider() {
  const [, documentZoom, setDocumentZoom] = useContext(DocumentContext);
  const [hovered, setHovered] = useState();
  const widthOfSlider = 100;
  const colorOfSliderText = hovered ? '#007bff' : '#616161';
  return (
    <>
      <Button
        className="btn-document-zoom"
        variant="outline-light"
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered()}
      >
        <div style={{ display: 'flex', margin: 'auto' }}>
          <ZoomIn style={{ marginRight: 5, fontSize: 16, color: colorOfSliderText }} />
        </div>
        <div style={{ display: 'flex', margin: 'auto', color: colorOfSliderText }}>
          <span style={{ width: 30, textAlign: 'center' }}>{documentZoom}</span>
          <span>%</span>
        </div>
        <div className="rangeSlider-container" style={{ width: hovered ? widthOfSlider : 0, overflow: 'hidden' }}>
          <div style={{
            minWidth: widthOfSlider, paddingLeft: 7, paddingRight: 3, height: 60,
          }}
          >
            <RangeSlider
              variant="primary"
              tooltip="off"
              size="sm"
              min={75}
              max={200}
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
            border: 1px solid #eeeeee !important;
            padding-top: 0px !important;
            padding-bottom: 0px !important;
            display: flex;
            flex-direction: row;
            height: 32px;
          }
          
          .rangeSlider-container {
            transition: width 0.5s;
            display: flex;
            overflow-x: hidden;
          }
          `}
      </style>
    </>
  );
}

export default DocumentZoomSlider;
