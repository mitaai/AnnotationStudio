import React, { useState } from 'react';
import {
  Nav, Row, Col, Navbar, Breadcrumb, Container, Modal, Table,
} from 'react-bootstrap';
import {
  InfoSquare,
} from 'react-bootstrap-icons';

import FilterPopover from '../FilterPopover';

const SecondNavbar = ({
  session,
  type,
  document,
  docView,
}) => {
  const metaData = {
    title: 'Title',
    resourceType: 'Resource Type',
    contributors: 'Contributors',
    bookTitle: 'Book Title',
    publication: 'Publication',
    series: 'Series',
    seriesNumber: 'Series Number',
    volume: 'Volume',
    issue: 'Issue',
    pageNumbers: 'Page Numbers',
    edition: 'Edition',
    publisher: 'Publisher',
    publicationDate: 'Publication Date',
    location: 'Location',
    rightsStatus: 'Rights Status',
    url: 'URL',
    accessed: 'Accessed',
    notes: 'Notes',
    state: 'State',
  };
  const [showMoreDocumentInfo, setShowMoreDocumentInfo] = useState();
  return (
    <>
      <Navbar bg="light" variant="light" className="second-navbar" data-testid="second-navbar">
        <Container>
          <Row>
            <Col sm={8}>
              <Nav>
                <Breadcrumb>
                  <Breadcrumb.Item active={type === 'dashboard'} href="/">Dashboard</Breadcrumb.Item>
                  {type === 'document' && (
                  <Breadcrumb.Item href="/documents" active={!document}>
                    Documents
                  </Breadcrumb.Item>
                  )}
                  {type === 'group' && (
                  <Breadcrumb.Item href="/groups" active={!document}>
                    Groups
                  </Breadcrumb.Item>
                  )}
                  {type === 'admin' && (
                  <Breadcrumb.Item active={!document}>
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
                  {type === 'annotations' && (
                  <Breadcrumb.Item active>
                    Annotations
                  </Breadcrumb.Item>
                  )}
                  {document && (
                  <Breadcrumb.Item active>{document.title}</Breadcrumb.Item>
                  )}
                  {type === 'document' && document && docView && (
                  <span id="btn-document-more-info">
                    <InfoSquare size="1.4em" onClick={() => { setShowMoreDocumentInfo(true); }} />
                  </span>
                  )}
                </Breadcrumb>
              </Nav>
            </Col>
          </Row>
        </Container>
        {type === 'document' && document && docView && (
        <>
          <div style={{ position: 'absolute', right: '16px', top: '7px' }}>
            <FilterPopover session={session} />
          </div>
          <Modal
            size="lg"
            show={showMoreDocumentInfo}
            onHide={() => setShowMoreDocumentInfo(false)}
            aria-labelledby="example-modal-sizes-title-sm"
          >
            <Modal.Header closeButton>
              <Modal.Title id="example-modal-sizes-title-sm">
                Document Info
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(metaData).map((key) => (
                    <tr>
                      <td>{metaData[key]}</td>
                      <td>{document[key] === undefined ? '' : document[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Modal.Body>
          </Modal>
        </>
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
};


export default SecondNavbar;
