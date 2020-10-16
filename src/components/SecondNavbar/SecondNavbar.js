import {
  Nav, Row, Col, Navbar, Breadcrumb, Container, Button, OverlayTrigger, Popover, Accordion, Card,
} from 'react-bootstrap';
import {
  InfoSquare, Filter, ShieldFillCheck, ChatLeftQuoteFill, PeopleFill, BookmarkFill, CalendarEventFill,
} from 'react-bootstrap-icons';

const SecondNavbar = ({
  type,
  title,
  docView,
}) => (
  <>
    <Navbar bg="light" variant="light" className="second-navbar">
      <Container>
        <Row>
          <Col sm={8}>
            <Nav>
              <Breadcrumb>
                <Breadcrumb.Item active={type === 'dashboard'} href="/">Home</Breadcrumb.Item>
                {type === 'document' && (
                  <Breadcrumb.Item href="/documents" active={!title}>
                    Library
                  </Breadcrumb.Item>
                )}
                {type === 'group' && (
                  <Breadcrumb.Item href="/groups" active={!title}>
                    Groups
                  </Breadcrumb.Item>
                )}
                {type === 'admin' && (
                  <Breadcrumb.Item active={!title}>
                    Administration
                  </Breadcrumb.Item>
                )}
                {type === 'profile' && (
                  <Breadcrumb.Item active>
                    Edit Profile
                  </Breadcrumb.Item>
                )}
                {type === 'newuser' && (
                  <Breadcrumb.Item active>
                    Registration
                  </Breadcrumb.Item>
                )}
                {title && (
                  <Breadcrumb.Item active>{title}</Breadcrumb.Item>
                )}
                {type === 'document' && title && docView && (
                <span id="btn-document-more-info">
                  <InfoSquare size="1.4em" />
                </span>
                )}
              </Breadcrumb>
            </Nav>
          </Col>
          {type === 'document' && title && docView && (
            <>
              <Col sm={4}>
                <OverlayTrigger
                  trigger="click"
                  key="filter-popover"
                  placement="bottom"
                  rootClose
                  overlay={(
                    <Popover id="filter-popover">
                      <Popover.Content>
                        <Accordion defaultActiveKey="0">
                          <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="0">
                              <ShieldFillCheck size="1.3em" />
                              By Permissions
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="0">
                              <Card.Body>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">Mine</span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">Groups</span>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Accordion.Collapse>
                          </Card>
                          <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="1">
                              <ChatLeftQuoteFill size="1.3em" />
                              Annotated By
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="1">
                              <Card.Body>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">Ben S.</span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">Courtney L. </span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">Joshua M. </span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">Kurt F. </span>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Accordion.Collapse>
                          </Card>
                          <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="2">
                              <PeopleFill size="1.3em" />
                              By Group
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="2">
                              <Card.Body>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">24.04-Fall20</span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">210l5-Spring19</span>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Accordion.Collapse>
                          </Card>
                          <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="3">
                              <BookmarkFill size="1.3em" />
                              By Tags
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="3">
                              <Card.Body>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">metaphor</span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">spooky</span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">dark</span>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col>
                                    <input className="filter-option-checkbox" type="checkbox" />
                                    <span className="filter-option-name">playful</span>
                                  </Col>
                                </Row>
                              </Card.Body>
                            </Accordion.Collapse>
                          </Card>
                          <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="4">
                              <CalendarEventFill size="1.3em" />
                              By Date Created
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="4">
                              <Card.Body>Hello! I'm another body</Card.Body>
                            </Accordion.Collapse>
                          </Card>
                        </Accordion>
                      </Popover.Content>
                    </Popover>
                  )}
                >
                  <Button id="btn-filter-annotation-well" variant="outline-primary">
                    <Filter size="1em" />
                    <span>Filter Annotations</span>
                  </Button>
                </OverlayTrigger>

              </Col>
            </>
          )}
        </Row>

      </Container>
    </Navbar>
    <style jsx global>
      {`
        .second-navbar .breadcrumb {
          background-color: #f8f9fa !important;
          margin-bottom: 0px;
        }
  
        .second-navbar .container .row {
            width: 100% !important;
        }
    
        .second-navbar #btn-document-more-info {
            float: right;
            margin-left: 5px;
            color: #007bff;
            cursor: pointer;
        }
        #btn-filter-annotation-well {
          margin-top: 7px;
          float: right;
        }

        #btn-filter-annotation-well svg {
          margin-right: 5px;
          position: relative;
          top: -2px;
        }

        #filter-popover {
          max-width: 30vw;
          width: 30vw;
        }

        #filter-popover .popover-body {
          padding: 0px;
        }

        #filter-popover .filter-option-checkbox {
          margin-right: 4px;
        }

        #filter-popover .filter-option-name {
          position: relative;
          top: -2px;
        }

        #filter-popover .arrow::after {
          border-bottom-color: rgb(245,245,245);
        }

        #filter-popover .accordion > .card {
          border-left: none;
          border-bottom: none;
          border-right: none;
        }

        #filter-popover .accordion .card .card-header {
          cursor: pointer;
        }

        #filter-popover .accordion .card .card-body{
          padding: 0.5rem 0.5rem 0.5rem 1.5rem;
        }

        #filter-popover .accordion .card .card-body > .row{
          margin: 2.5px 0px;
        }

        #filter-popover .accordion .card .card-header:hover {
          color: #007bff;
        }

        #filter-popover .accordion > .card:first-child {
          border: none;
        }

        #filter-popover .accordion .card .card-header svg {
          margin-right: 4px;
        }

      `}
    </style>
  </>
);

export default SecondNavbar;
