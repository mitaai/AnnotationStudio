import React, { useState, useEffect } from 'react';
import Router from 'next/router';
import ReactHtmlParser from 'react-html-parser';
import {
  PeopleFill,
  PersonFill,
  PersonPlusFill,
} from 'react-bootstrap-icons';

import { fetchSharedAnnotationsOnDocument } from '../../utils/annotationUtil';
import { fixIframes } from '../../utils/parseUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';
import {
  ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';

import AnnotationTile from './AnnotationTile';

import styles from './DashboardChannels.module.scss';

export default function AnnotationsChannel({
  session, slug, setAlerts, maxNumberOfAnnotationTags = 3, flex,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState('shared');
  const [listLoading, setListLoading] = useState();
  const [annotations, setAnnotations] = useState();

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
      count: annotations === undefined ? 0 : annotations.mine.length,
      selected: selectedPermissions === 'mine',
      onClick: () => { setSelectedPermissions('mine'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Shared with group(s)',
      textWidth: 145,
      count: annotations === undefined ? 0 : annotations.shared.length,
      selected: selectedPermissions === 'shared',
      onClick: () => { setSelectedPermissions('shared'); },
      icon: <PeopleFill size="1.2em" />,
    },
    {
      text: 'Shared with me',
      textWidth: 115,
      count: annotations === undefined ? 0 : annotations['shared-with-me'].length,
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
      onClick={() => Router.push(`/documents/${slug}?mine=${mine ? 'true' : 'false'}&aid=${_id}`)}
      text={target.selector.exact}
      author={name}
      annotation={value.length > 0 ? ReactHtmlParser(value, { transform: fixIframes }) : ''}
      activityDate={modified}
      tags={tags}
      maxNumberOfAnnotationTags={maxNumberOfAnnotationTags}
    />
  );

  useEffect(() => {
    if (slug === undefined) {
      setAnnotations();
      setSelectedPermissions('shared');
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

        setAnnotations(a);
        setListLoading();

        if (a.shared.length === 0 && a.mine.length > 0) {
          setSelectedPermissions('mine');
        } else {
          setSelectedPermissions('shared');
        }
      }).catch((err) => {
        setAlerts([{ text: err.message, variant: 'danger' }]);
        setListLoading();
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);


  let annotationTiles;

  if (annotations === undefined) {
    annotationTiles = <EmptyListMessage text="No document selected" />;
  } else if (annotations[selectedPermissions].length === 0) {
    annotationTiles = <EmptyListMessage />;
  } else {
    annotationTiles = annotations[selectedPermissions];
  }

  return (
    <div className={styles.channelContainer} style={{ flex }}>
      <div className={styles.headerContainer}>
        <div style={{ display: 'flex', flex: 1 }}>
          <span className={styles.headerText}>
            Annotations
          </span>
        </div>
        <PermissionsButtonGroup buttons={buttons} />
      </div>
      <div className={styles.tileContainer}>
        {listLoading ? <ListLoadingSpinner /> : annotationTiles}
      </div>
    </div>
  );
}
