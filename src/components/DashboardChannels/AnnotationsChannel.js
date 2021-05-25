import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Router from 'next/router';
import ReactHtmlParser from 'react-html-parser';
import {
  ArrowClockwise,
  PeopleFill,
  PersonFill,
  PersonPlusFill,
} from 'react-bootstrap-icons';

import {
  OverlayTrigger, Popover,
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
import ISGroupHeader from '../IdeaSpaceComponents/ISGroupHeader';

export default function AnnotationsChannel({
  session,
  slug,
  setAlerts,
  maxNumberOfAnnotationTags = 3,
  flex,
  selectedDocumentId,
  selectedGroupId,
  selectedDocumentSlug,
  documentPermissions,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState('shared');
  const [listLoading, setListLoading] = useState();
  const [annotations, setAnnotations] = useState({});
  const [refresh, setRefresh] = useState();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, forceUpdateForRefresh] = useState();
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;

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


  let annotationTiles;

  if (slug === undefined) {
    annotationTiles = <EmptyListMessage text="No document selected" />;
  } else if (annotations[slug] === undefined) {
    annotationTiles = <EmptyListMessage />;
  } else if (annotations[slug][selectedPermissions].length === 0) {
    annotationTiles = <EmptyListMessage />;
  } else {
    annotationTiles = annotations[slug][selectedPermissions];
  }

  return (
    <div className={styles.channelContainer} style={{ flex }}>
      <div className={styles.headerContainer}>
        <div style={{ display: 'flex', flex: 1 }}>
          <span className={styles.headerText}>
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

        <PermissionsButtonGroup buttons={buttons} />
      </div>
      <div className={styles.tileContainer}>
        <ISGroupHeader
          name="Group Name"
          collapsed
          numberOfAnnotations={12}
        />
        {(listLoading || refresh) ? <ListLoadingSpinner /> : annotationTiles}
      </div>
    </div>
  );
}
