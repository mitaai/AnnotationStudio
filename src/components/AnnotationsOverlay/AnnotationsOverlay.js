import { useContext, useEffect } from 'react';
import $ from 'jquery';
import {
  Popover,
  Overlay,
} from 'react-bootstrap';

import { DocumentActiveAnnotationsContext } from '../../contexts/DocumentContext';

export default function AnnotationsOverlay() {
  const [activeAnnotations, setActiveAnnotations] = useContext(DocumentActiveAnnotationsContext);
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (e.target.closest('.annotation-highlighted-text.filtered') === null) {
        setActiveAnnotations({ annotations: [], target: null });
      }
    };
    // adding a click event listener to document so if the document is clicked we can check if where it was click there is an annotation and if not then we hide the Overlay
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  });
  return (
    <Overlay
      show={activeAnnotations.annotations.length > 0}
      target={activeAnnotations.target}
    >
      <Popover id="popover-contained">
        <Popover.Content>
          <div>Popover for annotations in mobile view</div>
          <div>
            once mobile view is finished
            {activeAnnotations.annotations.length}
            {' '}
            {activeAnnotations.annotations.length === 1 ? 'annotation' : 'annotations'}
            {' '}
            will be shown here
          </div>
        </Popover.Content>
      </Popover>
    </Overlay>
  );
}
