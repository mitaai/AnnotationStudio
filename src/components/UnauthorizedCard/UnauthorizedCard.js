import { Card } from 'react-bootstrap';

const UnauthorizedCard = () => (
  <Card>
    <Card.Header><Card.Title>Not authorized</Card.Title></Card.Header>
    <Card.Body>You are not authorized to view this page.</Card.Body>
  </Card>
);

export default UnauthorizedCard;
