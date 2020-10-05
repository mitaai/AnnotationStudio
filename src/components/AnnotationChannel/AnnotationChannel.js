import {
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
} from 'react-bootstrap';

import AnnotationCard from '../AnnotationCard';

function AnnotationChannel({ side }) {
  return (
    <>
      <div>
        <AnnotationCard side={side} expanded={false} />
      </div>
      <style jsx global>
        {`
          
        `}
      </style>
    </>
  );
}

export default AnnotationChannel;
