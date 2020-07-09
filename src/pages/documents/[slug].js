
import { useRouter } from 'next/router';
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
  ListGroup,
} from 'react-bootstrap';
import Layout from '../../components/Layout';

export default function DocumentPage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <Layout>
      <Container>
        <Row id="document-container">
          <Col sm={8}>
            <Card id="document-card-container">
              <Card.Body>
                is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
              </Card.Body>
            </Card>
          </Col>
          <Col sm={4}>
            <Card id="annotation-well-card-container">
              <Card.Body>
                <Row id="annotation-well-header">
                  <Col>
                    <ButtonGroup size="sm">
                      <Button variant="secondary">Mine</Button>
                      <Button variant="light">Groups</Button>
                    </ButtonGroup>
                    <ButtonGroup size="sm">
                      <Button variant="secondary">Whole Text</Button>
                      <Button variant="light">Visible Text</Button>
                    </ButtonGroup>
                  </Col>
                </Row>
                <Row id="annotation-list-container">
                  <Col>
                    <Row>
                      <Col>
                        <Card>
                          <Card.Body>This is some text within a card body.</Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Card>
                          <Card.Body>This is some text within a card body.</Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <Card>
                          <Card.Body>This is some text within a card body.</Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
}
