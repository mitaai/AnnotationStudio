/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowClockwise,
  PeopleFill,
  PersonFill,
} from 'react-bootstrap-icons';

import {
  getDocumentsByGroupByUser, addGroupNamesToDocuments,
} from '../../utils/docUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';
import {
  NewButton, ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';

import DocumentTile from './DocumentTile';

import styles from './DashboardChannels.module.scss';
import { DeepCopyObj } from '../../utils/docUIUtils';

export default function DocumentsChannel({
  flex,
  session,
  setAlerts,
  forceUpdate,
  selectedGroupId = 'privateGroup',
  setSelectedGroupId,
  selectedDocumentId,
  setSelectedDocumentId,
  selectedDocumentSlug,
  setSelectedDocumentSlug,
  documentPermissions,
  setDocumentPermissions,
  maxNumberOfDocumentGroups = 3,
}) {
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState({});
  const [loadMore, setLoadMore] = useState();
  const [refresh, setRefresh] = useState();
  const perPage = 10;
  const numberOfDocuments = documents[selectedGroupId] === undefined
  || documents[selectedGroupId][documentPermissions] === undefined
    ? 0
    : documents[selectedGroupId][documentPermissions].docs.length;
  const buttons = [
    {
      text: 'Mine',
      textWidth: 40,
      count: documentPermissions === 'mine' ? numberOfDocuments : 0,
      selected: documentPermissions === 'mine',
      onClick: () => { setDocumentPermissions('mine'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Shared',
      textWidth: 60,
      count: documentPermissions === 'shared' ? numberOfDocuments : 0,
      selected: documentPermissions === 'shared',
      onClick: () => { setDocumentPermissions('shared'); },
      icon: <PeopleFill size="1.2em" />,
    },
  ];

  const organizeDocumentsByGroup = (docs, groupId) => {
    const sortedDocs = docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const d = DeepCopyObj(documents);
    if (refresh) {
      d[groupId][documentPermissions] = {
        canLoadMore: sortedDocs.length === perPage,
        docs: sortedDocs,
        page: 2,
      };
    } else if (d[groupId]) {
      if (d[groupId][documentPermissions]) {
        // loading more information
        d[groupId][documentPermissions].docs = d[groupId][documentPermissions].docs
          .concat(sortedDocs);
        d[groupId][documentPermissions].canLoadMore = sortedDocs.length === perPage;
        d[groupId][documentPermissions].page += 1;
      } else {
        d[groupId][documentPermissions] = { docs: sortedDocs, page: 2 };
      }
    } else {
      d[groupId] = {};
      d[groupId][documentPermissions] = {
        canLoadMore: sortedDocs.length === perPage,
        docs: sortedDocs,
        page: 2,
      };
    }

    return d;
  };

  const getPageNumber = () => {
    if (!refresh
      && documents[selectedGroupId] !== undefined
      && documents[selectedGroupId][documentPermissions] !== undefined
    ) {
      return documents[selectedGroupId][documentPermissions].page;
    }
    return 1;
  };

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        if (!loadMore
            && documents[selectedGroupId] !== undefined
            && documents[selectedGroupId][documentPermissions] !== undefined
            && !refresh
        ) {
          // this means that the data has been loaded in already
          return;
        }
        if (!loadMore) {
          setListLoading(true);
        }

        if (documentPermissions === 'shared') {
          await getDocumentsByGroupByUser({
            groups: [{ id: selectedGroupId }],
            perPage,
            page: getPageNumber(),
            mine: false,
          })
            .then(async (data) => {
              const { docs } = data;
              await addGroupNamesToDocuments(docs)
                .then((allDocs) => {
                  setDocuments(organizeDocumentsByGroup(allDocs, selectedGroupId));
                  setListLoading(false);
                  setRefresh(false);
                  setLoadMore(false);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
              setRefresh(false);
              setLoadMore(false);
            });
        } else if (documentPermissions === 'mine') {
          await getDocumentsByGroupByUser({
            groups: selectedGroupId === 'privateGroup' ? [] : [{ id: selectedGroupId }],
            id: session.user.id,
            perPage,
            page: getPageNumber(),
            mine: true,
          })
            .then(async (data) => {
              const { docs } = data;
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(organizeDocumentsByGroup(docsWithGroupNames, selectedGroupId));
                  setListLoading(false);
                  setRefresh(false);
                  setLoadMore(false);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
              setRefresh(false);
              setLoadMore(false);
            });
        }
      }
    }
    fetchData();
  }, [loadMore, selectedGroupId, refresh, documentPermissions, forceUpdate, session, setAlerts]);

  useEffect(() => {
    if (selectedGroupId === 'privateGroup' && documentPermissions === 'shared') {
      setDocumentPermissions('mine');
    }
  }, [selectedGroupId, documentPermissions]);

  let documentTiles = documents[selectedGroupId] === undefined
  || documents[selectedGroupId][documentPermissions] === undefined
    ? []
    : documents[selectedGroupId][documentPermissions].docs.map(({
      _id, title, groups, contributors, updatedAt, slug, owner,
    }) => {
      const contributor = contributors.find(({ type }) => type.toLowerCase() === 'author');
      const author = contributor === undefined ? 'Author' : contributor.name;
      return (
        <DocumentTile
          key={_id}
          id={_id}
          name={title}
          author={author}
          slug={slug}
          isOwner={owner === session.user.id}
          activityDate={updatedAt}
          selected={_id === selectedDocumentId}
          groups={groups}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          maxNumberOfDocumentGroups={maxNumberOfDocumentGroups}
          dashboardState={`${_id !== undefined && slug !== undefined ? `did=${_id}&slug=${slug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`}
          onClick={() => { setSelectedDocumentId(_id); setSelectedDocumentSlug(slug); }}
        />
      );
    });

  if (documentTiles.length === 0) {
    documentTiles = <EmptyListMessage />;
  }

  const canLoadMoreDocs = (documents[selectedGroupId] !== undefined
    && documents[selectedGroupId][documentPermissions] !== undefined)
    ? documents[selectedGroupId][documentPermissions].canLoadMore
    : false;

  const loadComponent = loadMore
    ? <ListLoadingSpinner />
    : (
      <div
        className={styles.loadMoreDocs}
        onClick={() => setLoadMore(true)}
        onKeyDown={() => {}}
        tabIndex={-1}
        role="button"
      >
        Load more documents
      </div>
    );

  const loadMoreDocs = canLoadMoreDocs ? loadComponent : <></>;

  return (
    <div className={styles.channelContainer} style={{ flex }}>
      <div className={styles.dividingLine} />
      <div className={styles.headerContainer}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
          <Link href={`/documents?${dashboardState}`}>
            <span className={`${styles.headerText} ${styles.headerLink}`}>
              Documents
            </span>
          </Link>
          <NewButton href="/documents/new" />
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
        </div>
        <PermissionsButtonGroup buttons={selectedGroupId === 'privateGroup' ? buttons.slice(0, 1) : buttons} />
      </div>
      <div className={styles.tileContainer}>
        {listLoading ? <ListLoadingSpinner /> : documentTiles}
        {loadMoreDocs}
      </div>

    </div>
  );
}
