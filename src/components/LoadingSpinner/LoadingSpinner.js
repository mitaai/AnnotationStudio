import {
  Card, Spinner,
} from 'react-bootstrap';

const LoadingSpinner = () => (
  <Card.Body className="text-center" data-testid="loading-spinner-card">
    <Spinner animation="border" role="status" data-testid="loading-spinner">
      <span className="sr-only">Loading...</span>
    </Spinner>
  </Card.Body>
);

export default LoadingSpinner;
