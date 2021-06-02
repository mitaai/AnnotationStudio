import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Router from 'next/router';
import ReactHtmlParser from 'react-html-parser';
import {
  ArrowClockwise,
  BookmarkFill,
  ChatRightQuoteFill,
  PeopleFill,
  PersonFill,
  PersonPlusFill,
  ShieldLockFill,
  FileEarmarkFill,
  CalendarEventFill,
} from 'react-bootstrap-icons';

import {
  OverlayTrigger, Popover, Modal, Button, Form,
} from 'react-bootstrap';

import { fetchSharedAnnotationsOnDocument } from '../../utils/annotationUtil';
import { fixIframes } from '../../utils/parseUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';
import {
  ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';

import AnnotationTile from './AnnotationTile';

import styles from './DashboardChannels.module.scss';
import { RID } from '../../utils/docUIUtils';
import TileBadge from '../TileBadge';
import ISFilterButton from '../IdeaSpaceComponents/ISFilterButton';
import OutlineTile from './OutlineTile';

export default function AnnotationsChannel({
  session,
  slug,
  setAlerts,
  maxNumberOfAnnotationTags = 3,
  width,
  left,
  opacity,
  mode,
  selectedDocumentId,
  selectedGroupId,
  selectedDocumentSlug,
  documentPermissions,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState('shared');
  const [listLoading, setListLoading] = useState();
  // for AS annotations
  const [annotations, setAnnotations] = useState({});
  // for IS annotations


  const [refresh, setRefresh] = useState();
  const [filters, setFilters] = useState([
    { id: '1', type: 'byPermissions', text: 'Private' },
    { id: '2', type: 'byGroup', text: 'ASTest4' },
    { id: '3', type: 'byDocument', text: 'Allan Watts asdfasf dafdsaf dsafsdfasdf sdffsdfa fdfsfaesfdsfsd f s afasfsdfsafsdaf asf d' },
    { id: '4', type: 'byDateCreated', text: 'ASTest4' },
    { id: '5', type: 'byTag', text: 'Allan Watts' },
    { id: '6', type: 'annotatedBy', text: 'ASTest4' },
  ]);
  const [tab, setTab] = useState('annotations');
  const [showNewOutlineModal, setShowNewOutlineModal] = useState();
  const deleteFilter = (deleteId) => {
    setFilters(filters.filter(({ id }) => id !== deleteId));
  };

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, forceUpdateForRefresh] = useState();
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;

  const filterIcons = {
    byPermissions: <ShieldLockFill size={14} style={{ marginRight: 4 }} />,
    annotatedBy: <ChatRightQuoteFill size={14} style={{ marginRight: 4 }} />,
    byGroup: <PeopleFill size={14} style={{ marginRight: 4 }} />,
    byDocument: <FileEarmarkFill size={14} style={{ marginRight: 4 }} />,
    byTag: <BookmarkFill size={14} style={{ marginRight: 4 }} />,
    byDateCreated: <CalendarEventFill size={14} style={{ marginRight: 4 }} />,
  };

  const byPermissionFilter = ({ email, permissions, filter }) => {
    if (filter === 'mine') { // mine
      return session.user.email === email;
    }

    if (filter === 'shared') { // shared
      return !permissions.private && !permissions.sharedTo;
    }

    if (filter === 'shared-with-me' && permissions.sharedTo !== undefined) { // shared with specific people
      return permissions.sharedTo.includes(session.user.id);
    }
    return false;
  };

  const buttons = [
    {
      text: 'Mine',
      textWidth: 40,
      count: annotations[slug] === undefined ? 0 : annotations[slug].mine.length,
      selected: selectedPermissions === 'mine',
      onClick: () => { setSelectedPermissions('mine'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Shared with group(s)',
      textWidth: 145,
      count: annotations[slug] === undefined ? 0 : annotations[slug].shared.length,
      selected: selectedPermissions === 'shared',
      onClick: () => { setSelectedPermissions('shared'); },
      icon: <PeopleFill size="1.2em" />,
    },
    {
      text: 'Shared with me',
      textWidth: 115,
      count: annotations[slug] === undefined ? 0 : annotations[slug]['shared-with-me'].length,
      selected: selectedPermissions === 'shared-with-me',
      onClick: () => { setSelectedPermissions('shared-with-me'); },
      icon: <PersonPlusFill size="1.2em" />,
    },
  ];

  const toAnnotationsTile = ({
    _id, target, creator: { name }, modified, body: { value, tags },
  }, mine) => (
    <AnnotationTile
      key={_id}
      onClick={() => Router.push(`/documents/${slug}?mine=${mine ? 'true' : 'false'}&aid=${_id}&${dashboardState}`)}
      text={target.selector.exact}
      author={name}
      annotation={value.length > 0 ? ReactHtmlParser(value, { transform: fixIframes }) : ''}
      activityDate={modified}
      tags={tags}
      maxNumberOfAnnotationTags={maxNumberOfAnnotationTags}
    />
  );

  const updateAnnotations = (annos) => {
    annotations[slug] = annos;
    setAnnotations(annotations);
  };

  useEffect(() => {
    if (slug === undefined) {
      setSelectedPermissions('shared');
      return;
    }

    if (annotations[slug] !== undefined && !refresh) {
      // we already have the annotations for this document so we don't need to reload that
      // information
      return;
    }

    setListLoading(true);
    fetchSharedAnnotationsOnDocument({ slug, prefetch: false })
      .then((annos) => {
        const sortedAnnos = annos.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        const a = {
          mine: sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'mine' })).map((anno) => toAnnotationsTile(anno, true)),
          shared: sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'shared' })).map((anno) => toAnnotationsTile(anno, false)),
          'shared-with-me': sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'shared-with-me' })).map((anno) => toAnnotationsTile(anno, false)),
        };

        updateAnnotations(a);
        setListLoading();
        setRefresh();
        setLastUpdated(new Date());

        if (a.shared.length === 0 && a.mine.length > 0) {
          setSelectedPermissions('mine');
        } else {
          setSelectedPermissions('shared');
        }
      }).catch((err) => {
        setAlerts([{ text: err.message, variant: 'danger' }]);
        setListLoading();
        setRefresh();
        setLastUpdated(new Date());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, refresh]);

  useEffect(() => {
    // this keeps the refresh popover text up-to-date
    setInterval(() => forceUpdateForRefresh(RID()), 60 * 1000);
  }, []);

  useEffect(() => {
    if (mode === 'as') {
      setTab('annotations');
    }
  }, [mode]);


  let annotationTiles;

  // if (mode === 'as') {
  if (slug === undefined) {
    annotationTiles = <EmptyListMessage text="No document selected" />;
  } else if (annotations[slug] === undefined) {
    annotationTiles = <EmptyListMessage />;
  } else if (annotations[slug][selectedPermissions].length === 0) {
    annotationTiles = <EmptyListMessage />;
  } else {
    annotationTiles = annotations[slug][selectedPermissions];
  }
  // }


  const annotationsTabSelected = tab === 'annotations';

  const tabSelectionLineOpacity = mode === 'is' ? 1 : 0;
  const tabSelectionLine = (
    <div
      className={styles.tabSelectionLine}
      style={annotationsTabSelected ? { width: 'calc(60% - 14px)', left: 0, opacity: tabSelectionLineOpacity } : { width: 'calc(40% + 14px)', left: 'calc(60% - 14px)', opacity: tabSelectionLineOpacity }}
    />
  );

  const tabContent = {
    annotations:
  <>
    {mode === 'is' && (
    <div className={styles.filtersContainer}>
      {filters.map(({ type, text, id }, i) => (
        <TileBadge
          key={id}
          icon={filterIcons[type]}
          color="blue"
          text={text}
          marginLeft={i > 0 ? 5 : 0}
          onDelete={() => deleteFilter(id)}
          fontSize={12}
        />
      ))}
    </div>
    )}
    <div className={styles.tileContainer}>
      {(listLoading || refresh) ? <ListLoadingSpinner /> : annotationTiles}
    </div>
  </>,
    outlines:
  <div className={styles.tileContainer}>
    <OutlineTile
      name="Outline Name"
      activityDate={new Date()}
      onClick={() => {}}
    />
  </div>,
  };

  return (
    <>
      <div className={styles.channelContainer} style={{ width, left, opacity }}>
        {mode === 'is' && <div className={styles.dividingLine} />}
        <div className={styles.headerContainer} style={{ borderBottom: '1px solid', borderColor: mode === 'as' ? 'transparent' : '#DADCE1' }}>
          {tabSelectionLine}
          <div style={{ display: 'flex', flex: 3 }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span
                onClick={() => setTab('annotations')}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="button"
                className={styles.headerText}
                style={{ color: annotationsTabSelected ? '#424242' : '#ABABAB' }}
              >
                Annotations
              </span>
            </div>
            <OverlayTrigger
              key="refresh-annotaitons"
              placement="bottom"
              overlay={(
                <Popover
                  id="popover-basic"
                >
                  <Popover.Content style={{ color: '#636363' }}>{`Refreshed ${moment(lastUpdated).fromNow()}`}</Popover.Content>
                </Popover>
            )}
            >
              <div
                className={styles.refreshButton}
                onClick={() => setRefresh(true)}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="button"
              >
                <span style={{ fontSize: 'inherit' }}>Refresh</span>
                <ArrowClockwise size={18} style={{ margin: 'auto 5px' }} />
              </div>
            </OverlayTrigger>
            {mode === 'as' ? <PermissionsButtonGroup buttons={buttons} /> : <ISFilterButton active={annotationsTabSelected} />}
          </div>
          {mode === 'is' && (
          <div style={{
            display: 'flex', flex: 2, borderLeft: '1px solid #DADCE1', marginLeft: 8, paddingLeft: 8,
          }}
          >
            <span
              onClick={() => setTab('outlines')}
              onKeyDown={() => {}}
              tabIndex={-1}
              role="button"
              className={styles.headerText}
              style={{ color: !annotationsTabSelected ? '#424242' : '#ABABAB' }}
            >
              Outlines
            </span>
            <TileBadge
              text="New + "
              color={!annotationsTabSelected ? 'yellow' : 'grey'}
              onClick={() => {
                setShowNewOutlineModal(true);
                setTab('outlines');
              }}
            />
          </div>
          )}
        </div>
        {tabContent[tab]}
      </div>
      <Modal
        show={showNewOutlineModal}
        onHide={() => setShowNewOutlineModal()}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Outline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Control type="email" placeholder="name of outline" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewOutlineModal()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowNewOutlineModal()}>Create</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
