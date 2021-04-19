import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PeopleFill,
  PersonFill,
} from 'react-bootstrap-icons';

import { getSharedDocumentsByGroup, getDocumentsByUser, addGroupNamesToDocuments } from '../../utils/docUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';
import {
  NewButton, ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';

import DocumentTile from './DocumentTile';

import styles from './DashboardChannels.module.scss';

export default function DocumentsChannel({
  flex,
  session,
  setAlerts,
  forceUpdate,
  selectedGroupId = 'privateGroup',
  setSelectedGroupId,
  selectedDocumentId,
  setSelectedDocumentId,
  setSelectedDocumentSlug,
  maxNumberOfDocumentGroups = 3,
}) {
  const [key, setKey] = useState('shared');
  const [listLoading, setListLoading] = useState(true);
  const [documents, setDocuments] = useState({});
  const numberOfDocuments = documents[selectedGroupId] === undefined
    ? 0
    : documents[selectedGroupId].length;
  const buttons = [
    {
      text: 'Mine',
      textWidth: 40,
      count: key === 'mine' ? numberOfDocuments : 0,
      selected: key === 'mine',
      onClick: () => { setKey('mine'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Shared',
      textWidth: 60,
      count: key === 'shared' ? numberOfDocuments : 0,
      selected: key === 'shared',
      onClick: () => { setKey('shared'); },
      icon: <PeopleFill size="1.2em" />,
    },
  ];

  const organizeDocumentsByGroup = (docs) => {
    const sortedDocs = docs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const organizedDocs = {
      privateGroup: [],
    };
    for (let i = 0; i < sortedDocs.length; i += 1) {
      const docGroups = sortedDocs[i].groups;
      if (docGroups.length > 0) {
        for (let j = 0; j < docGroups.length; j += 1) {
          // eslint-disable-next-line no-underscore-dangle
          const groupId = docGroups[j]._id;
          // make sure that this id has an array that represents it
          if (organizedDocs[groupId] === undefined) {
            organizedDocs[groupId] = [];
          }
          // adding document to a group that it is in
          organizedDocs[groupId].push(sortedDocs[i]);
        }
      } else {
        // if the document has no groups it is attached to then it will go to the privateGroup
        organizedDocs.privateGroup.push(sortedDocs[i]);
      }
    }

    return organizedDocs;
  };

  useEffect(() => {
    async function fetchData() {
      if (session && (session.user.groups || session.user.id)) {
        setListLoading(true);
        if (key === 'shared') {
          await getSharedDocumentsByGroup({
            groups: session.user.groups,
            limit: 7,
          })
            .then(async (data) => {
              const { docs } = data;
              await addGroupNamesToDocuments(docs)
                .then((allDocs) => {
                  setDocuments(organizeDocumentsByGroup(allDocs));
                  setListLoading(false);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        } else if (key === 'mine') {
          await getDocumentsByUser({ id: session.user.id, limit: 7 })
            .then(async (data) => {
              const { docs } = data;
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(organizeDocumentsByGroup(docsWithGroupNames));
                  setListLoading(false);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        }
      }
    }
    fetchData();
  }, [key, forceUpdate, session, setAlerts]);

  useEffect(() => {
    if (selectedGroupId === 'privateGroup' && key === 'shared') {
      setKey('mine');
    }
  }, [selectedGroupId, key]);

  let documentTiles = documents[selectedGroupId] === undefined
    ? []
    : documents[selectedGroupId].map(({
      _id, title, groups, contributors, updatedAt, slug,
    }) => {
      const contributor = contributors.find(({ type }) => type.toLowerCase() === 'author');
      const author = contributor === undefined ? 'Author' : contributor.name;
      return (
        <DocumentTile
          key={_id}
          name={title}
          author={author}
          slug={slug}
          activityDate={updatedAt}
          selected={_id === selectedDocumentId}
          groups={groups}
          selectedGroupId={selectedGroupId}
          setSelectedGroupId={setSelectedGroupId}
          maxNumberOfDocumentGroups={maxNumberOfDocumentGroups}
          onClick={() => { setSelectedDocumentId(_id); setSelectedDocumentSlug(slug); }}
        />
      );
    });

  if (documentTiles.length === 0) {
    documentTiles = <EmptyListMessage />;
  }

  return (
    <div className={styles.channelContainer} style={{ flex }}>
      <div className={styles.dividingLine} />
      <div className={styles.headerContainer}>
        <div style={{ display: 'flex', flex: 1 }}>
          <Link href="/documents">
            <span className={`${styles.headerText} ${styles.headerLink}`}>
              Documents
            </span>
          </Link>
          <NewButton href="/documents/new" />
        </div>
        <PermissionsButtonGroup buttons={selectedGroupId === 'privateGroup' ? buttons.slice(0, 1) : buttons} />
      </div>
      <div className={styles.tileContainer}>
        {listLoading ? <ListLoadingSpinner /> : documentTiles}
      </div>

    </div>
  );
}
