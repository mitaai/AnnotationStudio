/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React, { useState, useContext, useEffect } from 'react';
import $ from 'jquery';
import {
  Nav,
  Row,
  Col,
  Navbar,
  Breadcrumb,
  Container,
  Button,
  OverlayTrigger,
  Popover,
  Form,
  Card,
  ButtonGroup,
  Badge,
  Spinner,
} from 'react-bootstrap';

import DocumentFiltersContext from '../../contexts/DocumentFiltersContext';
import DocumentAnnotationsContext from '../../contexts/DocumentAnnotationsContext';


function HeatMap() {
  const lineHeight = 18;
  const scaleFactor = $('#document-container').height() / $('#document-card-container').height();
  const minStrokeHeight = 1;
  const offsetTop = $('#document-container').offset() === undefined ? 0 : $('#document-container').offset().top;
  const grandularity = lineHeight * scaleFactor >= minStrokeHeight ? lineHeight : Math.ceil(minStrokeHeight / scaleFactor);
  const [channelAnnotations] = useContext(DocumentAnnotationsContext);
  const [documentFilters] = useContext(DocumentFiltersContext);
  const n = (Math.ceil($('#document-card-container').height() / grandularity));
  const map = new Array(isNaN(n) ? 0 : n);

  for (const side in channelAnnotations) {
    if (channelAnnotations[side] !== null) {
      for (const anno of channelAnnotations[side]) {
        if (documentFilters.annotationIds[side] === null || documentFilters.annotationIds[side].includes(anno._id)) {
          // now we have to convert the annotations position and height into starting and ending indexs for the map
          let startIndex = Math.floor((anno.position.top - offsetTop) / grandularity);
          startIndex = startIndex < 0 ? 0 : startIndex;
          const endIndex = Math.floor((anno.position.top + anno.position.height - offsetTop) / grandularity);
          for (let i = startIndex; i <= endIndex; i += 1) {
            if (map[i] === undefined) {
              map[i] = 0;
            }
            map[i] += 1;
          }
        }
      }
    }
  }

  console.log(map);


  return (
    <>
      <style jsx global>
        {`
        
        
        `}
      </style>
    </>
  );
}

export default HeatMap;
