import {
  Nav, Row, Col, Navbar, Breadcrumb, Container, Button,
} from 'react-bootstrap';
import { InfoSquare, FilterSquare } from 'react-bootstrap-icons';

const SecondNavbar = ({
  type,
  title,
  docView,
}) => (
  <>
    <Navbar bg="light" variant="light" className="second-navbar">
      <Container>
        <Row>
          <Col sm={7}>
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
              </Breadcrumb>
            </Nav>
          </Col>
          {type === 'document' && title && docView && (
            <>
              <Col sm={1}>
                <span id="btn-document-more-info">
                  <InfoSquare size="1.4em" />
                </span>
              </Col>
              <Col sm={2}>
                <div id="annotations-header-label">
                  <span>Annotations</span>
                </div>
              </Col>
              <Col sm={2}>
                <Button id="btn-filter-annotation-well" variant="link">
                  <FilterSquare size="1em" />
                  <span>Filter</span>
                </Button>
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

export default SecondNavbar;
