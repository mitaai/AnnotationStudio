/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import {
  PeopleFill,
  PersonFill,
  PersonCheckFill,
} from 'react-bootstrap-icons';

import {
  getDocumentsByGroupByUser, addGroupNamesToDocuments, searchForDocuments,
} from '../../utils/docUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';
import {
  ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';

import DocumentTile from './DocumentTile';

import styles from './DashboardChannels.module.scss';
import { DeepCopyObj, RID } from '../../utils/docUIUtils';
import ChannelHeader from './ChannelHeader';

export default function DocumentsChannel({
  width,
  left,
  opacity,
  session,
  setAlerts,
  forceUpdate,
  selectedGroupId,
  setSelectedGroupId,
  selectedDocumentId,
  setSelectedDocumentId,
  setSelectedDocumentSlug,
  documents,
  setDocuments,
  documentPermissions,
  setDocumentPermissions,
  groupMembers,
  maxNumberOfDocumentGroups = 3,
  dashboardState,
}) {
  const [listLoading, setListLoading] = useState(true);
  const [loadMore, setLoadMore] = useState();
  const [refresh, setRefresh] = useState();
  const [, setLastUpdated] = useState(new Date());
  const [, forceUpdateForRefresh] = useState();
  const [selectedItem, setSelectedItem] = useState('by-date-created');
  const [asc, setAsc] = useState();
  const [searchQuery, setSearchQuery] = useState();
  const [queriedDocuments, setQueriedDocuments] = useState();
  const perPage = 25;
  const numberOfDocuments = documents[selectedGroupId]?.countByPermissions === undefined
    || documents[selectedGroupId].countByPermissions[documentPermissions] === undefined
    ? 0
    : documents[selectedGroupId].countByPermissions[documentPermissions];

  const numberOfQueriedDocuments = queriedDocuments?.length;

  const buttons = [
    {
      text: 'Mine',
      textWidth: 40,
      count: documentPermissions === 'mine' ? numberOfDocuments : 0,
      queryCount: documentPermissions === 'mine' && searchQuery !== undefined
        ? numberOfQueriedDocuments
        : undefined,
      selected: documentPermissions === 'mine',
      onClick: () => { setDocumentPermissions('mine'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Core Documents',
      textWidth: 118,
      count: documentPermissions === 'core-documents' ? numberOfDocuments : 0,
      queryCount: documentPermissions === 'core-documents' && searchQuery !== undefined
        ? numberOfQueriedDocuments
        : undefined,
      selected: documentPermissions === 'core-documents',
      onClick: () => { setDocumentPermissions('core-documents'); },
      icon: <PersonCheckFill size="1.2em" />,
    },
    {
      text: 'Contributions',
      textWidth: 100,
      count: documentPermissions === 'shared' ? numberOfDocuments : 0,
      queryCount: documentPermissions === 'shared' && searchQuery !== undefined
        ? numberOfQueriedDocuments
        : undefined,
      selected: documentPermissions === 'shared',
      onClick: () => { setDocumentPermissions('shared'); },
      icon: <PeopleFill size="1.2em" />,
    },
  ];

  const updateDocuments = (d) => {
    const newDocuments = DeepCopyObj(documents);
    if (newDocuments[selectedGroupId]) {
      if (d?.countByPermissions?.shared) {
        newDocuments[selectedGroupId].countByPermissions.shared = d.countByPermissions.shared;
      } else if (d?.countByPermissions && d?.countByPermissions['core-documents']) {
        newDocuments[selectedGroupId].countByPermissions['core-documents'] = d.countByPermissions['core-documents'];
      } else if (d?.countByPermissions?.mine) {
        newDocuments[selectedGroupId].countByPermissions.mine = d.countByPermissions.mine;
      }

      if (Array.isArray(newDocuments[selectedGroupId][documentPermissions])) {
        newDocuments[selectedGroupId][documentPermissions].push(...d[documentPermissions]);
      } else {
        newDocuments[selectedGroupId][documentPermissions] = d[documentPermissions];
      }
    } else {
      newDocuments[selectedGroupId] = d;
    }

    setDocuments(newDocuments);
  };

  const groupOwnersAndManagers = (groupMembers[selectedGroupId] || []).slice().reduce(
    // eslint-disable-next-line no-underscore-dangle
    (arr, member) => arr.concat((member.role === 'owner' || member.role === 'manager') ? [member.id] : []),
    [],
  );

  useEffect(() => {
    if (searchQuery && selectedGroupId) {
      searchForDocuments({
        query: searchQuery,
        condition: {
          group: selectedGroupId,
          permissions: documentPermissions,
          groupOwnersAndManagers,
          noDrafts: false,
        },
      }).then(({ documents: docs }) => setQueriedDocuments(docs));
    } else {
      // this means that the search query is either undefined or empty ''
      setQueriedDocuments();
    }
  }, [searchQuery]);


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

        const skip = (documents[selectedGroupId] === undefined
          || documents[selectedGroupId][documentPermissions]?.length === undefined)
          ? 0
          : documents[selectedGroupId][documentPermissions].length;

        const countByPermissions = documents[selectedGroupId]?.countByPermissions === undefined;

        const permissions = documentPermissions === 'mine' ? undefined : {
          contributions: documentPermissions === 'shared',
          groupDocuments: documentPermissions === 'core-documents',
        };

        await getDocumentsByGroupByUser({
          groups: selectedGroupId === 'privateGroup' ? [] : [{ id: selectedGroupId }],
          id: documentPermissions === 'mine' ? session.user.id : undefined,
          perPage,
          skip,
          countByPermissions,
          mine: documentPermissions === 'mine',
          groupOwnersAndManagers,
          permissions,
          noDrafts: false,
          sort: { updatedAt: -1 },
        })
          .then(async (data) => {
            const { docs, count } = data;
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                const d = {
                  countByPermissions: {
                    [documentPermissions]: count,
                  },
                  [documentPermissions]: docsWithGroupNames,
                };

                updateDocuments(d);


                setListLoading(false);

                if (refresh) {
                  setRefresh();
                }

                if (loadMore) {
                  setLoadMore(false);
                }

                setLastUpdated(new Date());
              });
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
            setRefresh();
            setLastUpdated(new Date());
            setLoadMore(false);
          });
      }
    }
    if (selectedGroupId) {
      fetchData();
    }
  }, [loadMore, selectedGroupId, refresh, documentPermissions, forceUpdate, session, setAlerts]);

  useEffect(() => {
    if (selectedGroupId === 'privateGroup' && documentPermissions === 'shared') {
      setDocumentPermissions('mine');
    }
  }, [selectedGroupId, documentPermissions]);

  useEffect(() => {
    // any time the user changes the group selected we clear the query
    setSearchQuery('');
  }, [selectedGroupId]);

  useEffect(() => {
    // this keeps the refresh popover text up-to-date
    setInterval(() => forceUpdateForRefresh(RID()), 60 * 1000);
  }, []);


  const sortDocuments = (a, b) => {
    const order = asc ? -1 : 1;
    if (selectedItem === 'by-date-created') {
      if (a.createdAt > b.createdAt) {
        return -order;
      }
      return order;
    }

    if (selectedItem === 'alpha') {
      if (a.title.toUpperCase() < b.title.toUpperCase()) {
        return -order;
      }
      return order;
    }

    return 0;
  };


  let showRefreshButton = true;
  let documentTiles;
  let rawDocumentTiles;
  if (selectedGroupId) {
    rawDocumentTiles = documents[selectedGroupId] === undefined
    || documents[selectedGroupId][documentPermissions] === undefined
      ? []
      : (queriedDocuments || documents[selectedGroupId][documentPermissions]).sort(sortDocuments);

    documentTiles = rawDocumentTiles.map(({
      _id, title, groups, contributors, updatedAt, slug, owner,
    }) => {
      const contributor = contributors ? contributors.find(({ type }) => type.toLowerCase() === 'author') : undefined;
      const author = contributor === undefined ? 'Author' : contributor.name;
      return (
        <DocumentTile
          key={_id}
          id={_id}
          documentTileId={`document-tile-${_id}`}
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
  } else {
    documentTiles = <EmptyListMessage text="No group selected" />;
    showRefreshButton = false;
  }

  if (documentTiles.length === 0) {
    documentTiles = <EmptyListMessage />;
  }

  const totalCount = documents[selectedGroupId]
    && documents[selectedGroupId]?.countByPermissions
    && documents[selectedGroupId]?.countByPermissions[documentPermissions];
  const currentCount = documents[selectedGroupId]
    && documents[selectedGroupId][documentPermissions]
    && documents[selectedGroupId][documentPermissions].length;
  const canLoadMoreDocs = totalCount !== undefined
    && currentCount !== undefined
    && totalCount > currentCount;

  const loadComponent = loadMore
    ? <ListLoadingSpinner />
    : (
      <div
        className={styles.loadMoreItems}
        onClick={() => setLoadMore(true)}
        onKeyDown={() => {}}
        tabIndex={-1}
        role="button"
      >
        <span>
          Load more documents
        </span>
      </div>
    );

  const loadMoreDocs = canLoadMoreDocs ? loadComponent : <></>;

  return (
    <div
      className={styles.channelContainer}
      style={{
        width, left, opacity, minWidth: 300,
      }}
    >
      <div className={styles.dividingLine} />
      <div className={styles.headerContainer} style={{ marginBottom: 0 }}>
        <ChannelHeader
          dashboardState={dashboardState}
          setRefresh={setRefresh}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          asc={asc}
          setAsc={setAsc}
          headerText="Documents"
          createNewText="New Document"
          createNewHref="/documents/new"
          searchPlaceholderText="Search Documents (title, authors, etc)"
          headerTextWidth={110}
          headerLink={`/documents?${dashboardState}&tab=${selectedGroupId === 'privateGroup' ? 'mine' : 'shared'}`}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchDisabled={selectedGroupId === undefined}
        />
        <PermissionsButtonGroup
          variant={showRefreshButton ? 'primary' : 'secondary'}
          buttons={selectedGroupId === 'privateGroup' ? buttons.slice(0, 1) : buttons}
        />
      </div>
      <div
        className={styles.tileContainer}
        style={{ paddingTop: 25 }}
        onScroll={() => {
          if (listLoading || refresh || !rawDocumentTiles?.length) {
            return;
          }
          rawDocumentTiles.map(({ _id }) => {
            const documentTile = $(`#document-tile-${_id}`);
            if (documentTile) {
              const threshold = 66;
              const stage1Height = 25;
              const { top } = documentTile.position();

              if (top < threshold - stage1Height) {
                const h = documentTile.height();
                const percentage = ((threshold - stage1Height) - top) / h;
                if (percentage <= 1) {
                  documentTile.css(
                    '-webkit-mask-image',
                    `-webkit-linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) ${percentage * 100}%, rgba(0, 0, 0, ${1 - percentage}) 100%)`,
                  );
                }
              } else if (top < threshold) {
                const percentage = (threshold - top) / stage1Height;
                documentTile.css(
                  '-webkit-mask-image',
                  `-webkit-linear-gradient(rgba(0, 0, 0, ${1 - percentage}) 0%, rgba(0, 0, 0, 1) 100%)`,
                );
              } else {
                documentTile.css('-webkit-mask-image', 'none');
              }
            }

            return null;
          });
        }}
      >
        {(listLoading || refresh) ? <ListLoadingSpinner /> : documentTiles}
        {loadMoreDocs}
      </div>

    </div>
  );
}
