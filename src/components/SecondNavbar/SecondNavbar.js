import {
  Nav, Row, Col, Navbar, Breadcrumb, Container, Button,
} from 'react-bootstrap';


function SecondNavbar() {
  return (
    <>
      <Navbar bg="light" variant="light" className="Second-Navbar">
        <Container>
          <Row>
            <Col sm={7}>
              <Nav>
                <Breadcrumb>
                  <Breadcrumb.Item href="#">Home</Breadcrumb.Item>
                  <Breadcrumb.Item href="https://getbootstrap.com/docs/4.0/components/breadcrumb/">
                    Library
                  </Breadcrumb.Item>
                  <Breadcrumb.Item active>Homer Oddessy</Breadcrumb.Item>
                </Breadcrumb>
              </Nav>
            </Col>
            <Col sm={1}>
              <span id="btn-document-more-info">
                <svg width="1.4em" height="1.4em" viewBox="0 0 16 16" className="bi bi-info-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                  <path d="M8.93 6.588l-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588z" />
                  <circle cx="8" cy="4.5" r="1" />
                </svg>
              </span>
            </Col>
            <Col sm={2}>
              <div id="annotations-header-label">
                <span>Annotations</span>
              </div>
            </Col>
            <Col sm={2}>
              <Button id="btn-filter-annotation-well" variant="link">
                <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-filter-square" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" />
                  <path fillRule="evenodd" d="M6 11.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
                </svg>
                <span>Filter</span>
              </Button>
            </Col>
          </Row>

        </Container>
      </Navbar>
      <style jsx global>
        {`
          .Second-Navbar .breadcrumb {
            background-color: #f8f9fa !important;
            margin-bottom: 0px;
          }
    
          .Second-Navbar .container .row {
              width: 100% !important;
          }
      
          .Second-Navbar #btn-document-more-info {
              float: right;
              margin-top: 12px;
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
          
        `}
      </style>
    </>
  );
}

export default SecondNavbar;
