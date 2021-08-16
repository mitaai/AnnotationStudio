import React, { useState, useEffect } from 'react';
import {
  Nav, Navbar, Breadcrumb, Container, Modal, Table, Row, Col, OverlayTrigger, Popover,
} from 'react-bootstrap';
import { InfoCircleFill, InfoSquare } from 'react-bootstrap-icons';
import FilterPopover from '../FilterPopover';
import { publicationFieldName } from '../../utils/metadataUtil';
import DocumentZoomSlider from '../DocumentZoomSlider/DocumentZoomSlider';
import styles from './SecondNavbar.module.scss';
import ArrowButton from '../ArrowButtton/ArrowButton';

const SecondNavbar = ({
  session,
  type,
  breadcrumbs,
  document,
  docView,
  dashboardState,
  mode,
  setMode,
}) => {
  const metadataFields = {
    title: 'Title',
    resourceType: 'Type',
    contributors: 'Contributors',
    publication: document ? publicationFieldName(document.resourceType) : 'Publication',
    series: 'Series',
    seriesNumber: 'Series number',
    volume: 'Volume',
    issue: 'Issue',
    pageNumbers: 'Page numbers',
    edition: 'Edition',
    publisher: 'Publisher',
    publicationDate: 'Publication date',
    location: 'Location',
    rightsStatus: 'Rights status',
    url: 'URL',
    accessed: 'Accessed',
    notes: 'Notes',
    state: 'State',
  };

  const [showMoreDocumentInfo, setShowMoreDocumentInfo] = useState();
  const [mobileView, setMobileView] = useState();

  useEffect(() => {
    if (type === 'document') {
      // eslint-disable-next-line no-undef
      const w = window;
      w.addEventListener('resize', () => {
        if (w.innerWidth < 1000) {
          setMobileView(true);
        } else if (w.innerWidth >= 1000) {
          setMobileView();
        }
      });
    }
  }, [type]);

  const documentColumnSize = mobileView ? 12 : 7;

  const breadcrumbsContent = Array.isArray(breadcrumbs)
    ? breadcrumbs.map(({ name, href }) => (
      href === undefined
        ? <Breadcrumb.Item active>{name}</Breadcrumb.Item>
        : <Breadcrumb.Item active={false} href={href}>{name}</Breadcrumb.Item>
    ))
    : (
      <>
        {type === 'document' && (
        <Breadcrumb.Item href={`/documents?${dashboardState}`} active={!document}>
          Documents
        </Breadcrumb.Item>
        )}
        {type === 'group' && (
        <Breadcrumb.Item href={`/groups?${dashboardState}`} active={!document}>
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
        <span className={styles.infobutton}>
          <InfoSquare size="1.4em" onClick={() => { setShowMoreDocumentInfo(true); }} />
        </span>
        )}
      </>
    );

  const size = mode === 'is' ? 12 : 8;

  return (
    <>
      <Navbar bg="light" variant="light" className={`px-0 ${styles.secondnav}`} data-testid="second-navbar">
        <Container fluid className="px-5">
          <Row className={styles.row} style={{ height: 48 }}>
            <Col
              md={type === 'document' ? documentColumnSize : size}
              style={{ display: 'flex' }}
            >
              {mode === 'is' ? (
                <>
                  <div style={{ position: 'absolute' }}>
                    <ArrowButton
                      onClick={() => setMode('as')}
                      text="Back To Dashboard"
                      direction="left"
                      marginLeft={30}
                      marginRight={0}
                      marginTop={7}
                      marginBottom={7}
                    />
                  </div>
                  <div style={{
                    fontSize: 18, color: '#424242', flex: 1, justifyContent: 'center', alignItems: 'center', display: 'flex',
                  }}
                  >
                    <span>Idea Space</span>
                  </div>
                </>
              ) : (
                <Nav>
                  <Breadcrumb className={styles.breadcontainer}>
                    <Breadcrumb.Item active={type === 'dashboard'} href={`/?${dashboardState}`}>Dashboard</Breadcrumb.Item>
                    {breadcrumbsContent}
                  </Breadcrumb>
                </Nav>
              )}
            </Col>
            {type === 'dashboard' && mode === 'as' && (
            <Col
              md={mobileView ? 12 : 4}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <div style={{ flex: 1 }} />
              {process.env.NEXT_PUBLIC_IDEA_SPACE_ENABLED === 'true' && (
              <>
                <OverlayTrigger
                  key="ideaspace-popover-info"
                  placement="bottom"
                  overlay={(
                    <Popover id="popover-basic">
                      <Popover.Content style={{ color: '#636363' }}>
                        Organizing your ideas has never been this easy! Idea Space is a writting
                        tool that is  designed to help individuals create outlines from the
                        annotations they make in just three easy steps.
                      </Popover.Content>
                    </Popover>
                )}
                >
                  <InfoCircleFill size={22} className={styles.ideaSpaceInfoIcon} />
                </OverlayTrigger>

                <ArrowButton
                  onClick={() => setMode('is')}
                  text="Open Idea Space"
                  marginLeft={5}
                />
              </>
              )}
            </Col>
            )}
            {type === 'document' && document && docView && (
              <Col
                md={mobileView ? 12 : 5}
                style={{ paddingLeft: (mobileView ? 15 : 0), paddingRight: 0 }}
              >
                <div className={styles.rightpanel} style={{ float: mobileView ? 'left' : 'right' }}>
                  <div className={styles['zoom-slider-container']}>
                    <DocumentZoomSlider />
                  </div>
                  <div className={styles['filter-container']}>
                    <FilterPopover session={session} />
                  </div>
                </div>
              </Col>
            )}
          </Row>
        </Container>
      </Navbar>
      {type === 'document' && document && docView && (
        <Modal
          size="lg"
          show={showMoreDocumentInfo}
          onHide={() => setShowMoreDocumentInfo(false)}
          aria-labelledby="document-metadata-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title id="document-metadata-modal" className={styles['modal-title']}>
              Metadata
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Table bordered size="sm">
              <tbody>
                {Object.keys(metadataFields).map((key) => {
                  let str = '';
                  if (document[key] !== undefined) {
                    if (Array.isArray(document[key])) {
                      str = document[key].map((v, i) => (
                        typeof (v) === 'object'
                          ? `${i === 0
                            ? ''
                            : ', '}${v.type}: ${v.name}`
                          : v
                      ));
                    } else {
                      str = document[key];
                    }
                    return (
                      <tr key={key}>
                        <td className={styles['meta-field-name']}>
                          <strong>{metadataFields[key]}</strong>
                        </td>
                        <td>{str}</td>
                      </tr>
                    );
                  } return '';
                })}
              </tbody>
            </Table>
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};


export default SecondNavbar;
