
import { useRouter } from 'next/router';
import {
  Container,
  Row,
  Col,
  Card,
  ButtonGroup,
  Button,
} from 'react-bootstrap';
import Layout from '../../../components/Layout';

export default function DocumentPage() {
  const router = useRouter();
  const { slug } = router.query;
  console.log(slug);

  return (
    <>
      <Layout type="document" title="Document Title" docView>
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
      <style jsx global>
        {`
          #annotations-header-label {
            padding: 12px 0px 0px 20px;
          }

          #document-container {
            height: calc(100vh - 230px);
            overflow-y: scroll;
            padding: 10px 0px;
          }
          
          #document-container #annotation-well-card-container {
            min-height: 100%;
            background-color: transparent;
          }

          #document-container #document-card-container {
            padding: 40px;
            font-family: 'Times';
            border-radius: 0px;
            min-height: 100%;
            border: none;
            box-shadow: 3px 3px 9px 0px rgba(0,0,0,0.38);
          }

          #document-container #annotation-well-card-container .card-body {
            padding: 10px;
          }
              
          #document-container #annotation-well-card-container .card-body #annotation-well-header {
              margin-bottom: 10px;
          }

          #document-container #annotation-well-card-container .card-body #annotation-list-container > .col > .row {
            margin-bottom: 5px;
          }  
  
          #document-container #annotation-well-card-container .card-body #annotation-list-container > .col > .row .card {
            border: none;
            box-shadow: 0px 0px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
          }
  
          #document-container #annotation-well-card-container .card-body .btn-group:first-child {
              margin-right: 10px;
          }
  
          #document-container #annotation-well-card-container .card-body .list-group-item {
              padding: 5px 10px;
          }
          
        `}
      </style>
    </>
  );
}
