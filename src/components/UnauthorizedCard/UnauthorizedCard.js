import { Card } from 'react-bootstrap';

const UnauthorizedCard = () => (
  <Card>
    <Card.Header><Card.Title>Not authorized</Card.Title></Card.Header>
    <Card.Body>Please log in to use the application.</Card.Body>
  </Card>
);

export default UnauthorizedCard;
