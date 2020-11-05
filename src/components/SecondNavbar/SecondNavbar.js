import {
  Nav, Row, Col, Navbar, Breadcrumb, Container, Button, OverlayTrigger, Popover, Form, Card, ButtonGroup,
} from 'react-bootstrap';
import {
  InfoSquare, Filter, ShieldFillCheck, ChatLeftQuoteFill, PeopleFill, BookmarkFill, CalendarEventFill,
} from 'react-bootstrap-icons';

import FilterPopover from '../FilterPopover';

const SecondNavbar = ({
  session,
  type,
  title,
  docView,
  annotations,
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
        </Row>
      </Container>
      {type === 'document' && title && docView && (
      <div style={{ position: 'absolute', right: '16px', top: '7px' }}>
        <FilterPopover session={session} annotations={annotations} />
      </div>
      )}
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

      `}
    </style>
  </>
);

export default SecondNavbar;
