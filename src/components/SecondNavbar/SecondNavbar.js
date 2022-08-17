/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import {
  Nav, Navbar, Breadcrumb, Container, Modal, Row, Col, OverlayTrigger, Popover, Tooltip,
} from 'react-bootstrap';
import {
  InfoCircleFill, InfoSquare, PencilFill, X,
} from 'react-bootstrap-icons';
import moment from 'moment';
import FilterPopover from '../FilterPopover';
import { publicationFieldName } from '../../utils/metadataUtil';
import DocumentZoomSlider from '../DocumentZoomSlider/DocumentZoomSlider';
import styles from './SecondNavbar.module.scss';
import ArrowButton from '../ArrowButtton/ArrowButton';
import TextAnalysisPopover from '../TextAnalysisPopover';
import Table from '../Table';

const SecondNavbar = ({
  session,
  type,
  breadcrumbs,
  getTextAnalysisData = () => {},
  document,
  docView,
  dashboardState,
  mode,
  setMode,
  borderBottom,
  extraContent,
  windowSize,
}) => {
  const metadataFields = {
    title: 'Title',
    resourceType: 'Type',
    contributors: 'Contributors',
    publication: document ? publicationFieldName(document.resourceType) : 'Publication',
    series: 'Series',
    seriesNumber: 'Number in series',
    volume: 'Volume',
    issue: 'Issue',
    pageNumbers: 'Page numbers',
    edition: 'Edition',
    publisher: 'Publisher',
    publicationDate: 'Publication date',
    publicationTitle: 'Publication title',
    websiteTitle: 'Website title',
    newspaperTitle: 'Newspaper title',
    magazineTitle: 'Magazine title',
    journalTitle: 'Journal Title',
    bookTitle: 'Book title',
    location: 'Publication location',
    rightsStatus: 'Rights status',
    url: 'URL',
    accessed: 'Accessed',
    notes: 'Notes',
    state: 'State',
  };

  const resourceTypeMetadata = {
    book: ['title', 'resourceType', 'publicationDate', 'publisher', 'location', 'rightsStatus', 'volume', 'edition', 'series', 'seriesNumber', 'url', 'accessed'],
    'book section': ['title', 'resourceType', 'bookTitle', 'publicationDate', 'publisher', 'location', 'rightsStatus', 'volume', 'edition', 'pageNumbers', 'series', 'seriesNumber', 'url', 'accessed'],
    'journal article': ['title', 'resourceType', 'journalTitle', 'publicationDate', 'publisher', 'location', 'rightsStatus', 'volume', 'edition', 'pageNumbers', 'url', 'accessed'],
    'magazine article': ['title', 'resourceType', 'magazineTitle', 'publicationDate', 'publisher', 'location', 'rightsStatus', 'volume', 'edition', 'pageNumbers', 'url', 'accessed'],
    'newspaper article': ['title', 'resourceType', 'newspaperTitle', 'publicationDate', 'publisher', 'location', 'rightsStatus', 'volume', 'edition', 'pageNumbers', 'url', 'accessed'],
    'web page': ['title', 'resourceType', 'websiteTitle', 'publicationDate', 'publisher', 'rightsStatus', 'url', 'accessed'],
    other: ['title', 'resourceType', 'publicationTitle', 'publicationDate', 'publisher', 'location', 'rightsStatus', 'pageNumbers', 'url', 'accessed'],

  };

  const rowHeaderWidth = 200;

  const rowHeaderStyle = {
    paddingLeft: 15, backgroundColor: '#f6f6f6', textAlign: 'left', justifyContent: 'center', alignItems: 'center', borderRight: '1px solid #EBEFF3', fontWeight: 500, width: rowHeaderWidth, height: 64,
  };


  const [showMoreDocumentInfo, setShowMoreDocumentInfo] = useState();
  const [mobileView, setMobileView] = useState();

  useEffect(() => {
    if (type === 'document') {
      setMobileView(windowSize.width < 1000);
    }
  }, [type, windowSize]);

  const documentColumnSize = mobileView ? 12 : 7;

  console.log('document', document);
  console.log('session', session);

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
      <Navbar
        style={{ borderBottom: borderBottom || '1px solid #ececec' }}
        className={`px-0 ${styles.secondnav}`}
        bg="light"
        variant="light"
        data-testid="second-navbar"
      >
        <Container
          fluid
          className={[windowSize.smallerThanOrEqual.isTabletOrMobile ? styles.mobileView : '', 'px-5'].join(' ')}
          style={{ transition: 'padding 0.5s' }}
        >
          <Row className={styles.row} style={{ height: 48 }}>
            <Col
              md={type === 'document' ? documentColumnSize : size}
              style={{ display: 'flex' }}
            >
              {extraContent}
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
              {(process.env.NEXT_PUBLIC_IDEA_SPACE_ENABLED === 'true' || process.env.NEXT_PUBLIC_IDEA_SPACE_ENABLED === true) && (
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
                  {(process.env.NEXT_PUBLIC_TEXT_ANALYSIS === 'true' || process.env.NEXT_PUBLIC_TEXT_ANALYSIS === true) && (
                    <div className={styles['filter-container']}>
                      <TextAnalysisPopover
                        textAnalysisData={document?.textAnalysisData}
                        getTextAnalysisData={getTextAnalysisData}
                        loadingTextAnalysisData={document?.loadingTextAnalysisData}
                      />
                    </div>
                  )}
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
          <Modal.Header style={{
            paddingLeft: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          >
            <div style={{ fontSize: 20, fontWeight: 500 }}>Metadata</div>
            {(session?.user?.role === 'admin' || session?.user?.id === document?.owner)
            && (
            <OverlayTrigger
              overlay={(
                <Tooltip className="styled-tooltip">
                  Edit metadata
                </Tooltip>
            )}
            >
              <PencilFill
                className={styles.editMetadataBtn}
                onClick={() => Router.push({
                  pathname: `/documents/${document?.slug}/edit`,
                })}
              />
            </OverlayTrigger>
            )}
            <div className={styles.closeModalBtn} style={{ marginLeft: 'auto' }} onClick={() => setShowMoreDocumentInfo()}>
              <X size={20} />
            </div>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: '#FBFBFB', borderRadius: 6 }}>
            <Table
              key="document-status-table"
              id="document-status-table"
              headerStyle={{ backgroundColor: '#f7f7f7' }}
              hoverable={false}
              noColumnHeaders
              columnHeaders={[
                {
                  minWidth: rowHeaderWidth,
                  style: {
                    padding: 0, borderRight: '1px solid #EBEFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent',
                  },
                },
                {
                  flex: 1,
                  style: {
                    padding: 0, borderRight: '1px solid #EBEFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, backgroundColor: '#f4f4f4',
                  },
                },
              ]}
              rows={resourceTypeMetadata[document.resourceType.toLowerCase()].map((key) => ({
                columns: [
                  {
                    content: metadataFields[key],
                    style: rowHeaderStyle,
                  },
                  {
                    content: key === 'accessed' ? moment(document[key]).format('MMMM Do YYYY, h:mm a') : document[key],
                  },
                ],
              }))}
              fadeOnScroll={false}
            />
          </Modal.Body>
        </Modal>
      )}
    </>
  );
};


export default SecondNavbar;
