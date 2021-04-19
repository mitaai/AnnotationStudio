import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Link from 'next/link';
import Router from 'next/router';
import ReactHtmlParser from 'react-html-parser';
import {
  LockFill,
  ThreeDotsVertical,
  PeopleFill,
  PersonFill,
  PersonPlusFill,
} from 'react-bootstrap-icons';
import {
  Dropdown, OverlayTrigger, Tooltip, Spinner,
} from 'react-bootstrap';
import TileBadge from '../TileBadge';
import { getSharedDocumentsByGroup, getDocumentsByUser, addGroupNamesToDocuments } from '../../utils/docUtil';
import { fetchSharedAnnotationsOnDocument } from '../../utils/annotationUtil';
import { fixIframes } from '../../utils/parseUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';

import styles from './DashboardChannels.module.scss';

function NewButton({ href }) {
  return (
    <Link href={href}>
      <span className={styles.newButton}>
        New +
      </span>
    </Link>

  );
}

function ListLoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', marginTop: 10 }}>
      <Spinner animation="border" />
    </div>
  );
}

function EmptyListMessage({ text = '0 items found' }) {
  return (
    <div style={{
      color: '#424242', fontSize: 14, textAlign: 'center', marginTop: 10,
    }}
    >
      {text}
    </div>
  );
}

function TilePointer({ selected }) {
  return (
    <>
      <span className={`${styles.tilePointerBackground} ${selected ? styles.tilePointerSelectedBackground : ''}`} />
      <span className={`${styles.tilePointer} ${selected ? styles.tilePointerSelected : ''}`} />
    </>
  );
}

const ThreeDotDropdown = React.forwardRef(({ onClick }, ref) => (
  <ThreeDotsVertical
    className={styles.moreTileOptions}
    size={20}
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  />
));

function GroupTile({
  name, memberCount = 0, position = 'Member', selected, onClick, privateGroup,
}) {
  const memberText = `${memberCount} member${(memberCount === 1 ? '' : 's')}`;
  const positionColors = {
    Member: 'grey',
    Manager: 'grey',
    Owner: 'green',
  };
  const color = positionColors[position] !== undefined ? positionColors[position] : 'grey';
  const tileBadge = <TileBadge color={color} text={position} />;
  return (
    <div
      className={`${styles.tile} ${selected ? styles.selectedTile : ''}`}
      onClick={onClick}
      onKeyDown={() => {}}
      role="button"
      tabIndex={0}
    >
      <TilePointer selected={selected} />
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div
          className={`${styles.name} ${privateGroup ? styles.privateGroupName : ''}`}
          style={privateGroup ? { marginBottom: 0 } : {}}
        >
          {privateGroup && <LockFill className={styles.privateGroupLock} size={16} />}
          <span>{name}</span>
        </div>
        {privateGroup
          ? <span style={{ marginTop: 5, marginBottom: 3 }}>{tileBadge}</span>
          : (
            <Dropdown
              onSelect={(eventKey) => {
                if (eventKey === 'manage') {
                  Router.push('/groups');
                }
              }}
            >
              <Dropdown.Toggle as={ThreeDotDropdown} id="dropdown-group-tile" />
              <Dropdown.Menu>
                <Dropdown.Item eventKey="manage">Manage</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}

      </div>
      {!privateGroup && (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div className={styles.memberText}>
          <span>{memberText}</span>
        </div>
        {tileBadge}
      </div>
      )}
    </div>
  );
}

function DocumentTile({
  name,
  groups = [],
  author,
  slug,
  selected,
  selectedGroupId,
  setSelectedGroupId,
  activityDate,
  maxNumberOfDocumentGroups,
  onClick,
}) {
  const [hovered, setHovered] = useState();
  let tileBadges = [];
  const g = groups.slice();

  if (g.length > 0) {
    const indexOfSelectedGroup = groups.findIndex(({ _id }) => _id === selectedGroupId);
    const selectedGroup = g.splice(indexOfSelectedGroup, 1)[0];
    tileBadges = [
      <TileBadge key="selectedGroup" color="blue" text={selectedGroup.name} />,
    ];
  }

  if (g.length >= maxNumberOfDocumentGroups) {
    tileBadges.push(<TileBadge key="moreGroups" color="grey" text={`+${g.length} more`} marginLeft={5} />);
  } else {
    tileBadges = tileBadges.concat(g.map(({ _id, name: n }) => (
      <TileBadge
        key={_id}
        onClick={() => setSelectedGroupId(_id)}
        color="grey"
        text={n}
        marginLeft={5}
      />
    )));
  }

  return (
    <div
      className={`${styles.tile} ${selected ? styles.selectedTile : ''}`}
      onClick={onClick}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered()}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered()}
      onKeyDown={() => {}}
      role="button"
      tabIndex={0}
    >
      <TilePointer selected={selected} />
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div className={styles.name}>{name}</div>
        <Dropdown
          onSelect={(eventKey) => {
            if (eventKey === 'edit') {
              Router.push(`/documents/${slug}/edit`);
            } else if (eventKey === 'manage') {
              Router.push('/documents');
            }
          }}
        >
          <Dropdown.Toggle as={ThreeDotDropdown} id="dropdown-document-tile" />
          <Dropdown.Menu>
            <Dropdown.Item eventKey="edit">Edit</Dropdown.Item>
            <Dropdown.Item eventKey="manage">Manage</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div style={{
          width: (selected || hovered) ? 45 : 0,
          transition: 'width 0.25s',
          overflow: 'hidden',
          paddingBottom: 3,
          paddingLeft: 3,
        }}
        >
          <TileBadge href={`/documents/${slug}`} color="yellow" text="Open" />
        </div>
        <div className={styles.memberText}>
          <span>{author}</span>
          <span className={styles.dotSeperator} />
          <OverlayTrigger
            key="document-activity-date-tooltip"
            placement="bottom"
            overlay={(
              <Tooltip>
                {moment(activityDate).format('LLLL')}
              </Tooltip>
            )}
          >
            <span>{moment(activityDate).fromNow()}</span>
          </OverlayTrigger>
        </div>
        {tileBadges}
      </div>
    </div>
  );
}

function AnnotationsTile({
  text = '', annotation = '', author = '', activityDate, tags, maxNumberOfAnnotationTags = 3,
}) {
  let tileBadges = [];
  if (tags.length > maxNumberOfAnnotationTags) {
    tileBadges = [
      <TileBadge key="tag1" color="grey" text={tags[0]} />,
      <TileBadge key="tag2" color="grey" text={tags[1]} marginLeft={5} />,
      <TileBadge key="moreTags" color="grey" text={`+${tags.length - 2} more`} marginLeft={5} />,
    ];
  } else {
    tileBadges = tags.map((t, i) => <TileBadge key={t} color="grey" text={t} marginLeft={i > 0 ? 5 : 0} />);
  }
  return (
    <div
      className={styles.tile}
    >
      <div className={styles.annotatedText}>
        {`"${text}"`}
      </div>
      <div className={styles.annotation}>
        {annotation}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div className={styles.memberText}>
          <span style={{ fontWeight: 'bold' }}>{author}</span>
          <span style={{
            width: 3, height: 3, borderRadius: 1.5, background: '#838383', marginLeft: 10, marginRight: 10,
          }}
          />
          <OverlayTrigger
            key="document-activity-date-tooltip"
            placement="bottom"
            overlay={(
              <Tooltip>
                {moment(activityDate).format('LLLL')}
              </Tooltip>
            )}
          >
            <span>{moment(activityDate).fromNow()}</span>
          </OverlayTrigger>
        </div>
        {tileBadges}
      </div>
    </div>
  );
}


export function GroupsChannel({
  flex, session, selectedGroupId, setSelectedGroupId,
}) {
  const [groups, setGroups] = useState([]);

  const groupTiles = [
    <GroupTile
      key="privateGroup"
      name="Private"
      privateGroup
      position="Owner"
      selected={selectedGroupId === 'privateGroup'}
      onClick={() => setSelectedGroupId('privateGroup')}
    />,
  ].concat(groups.map(({
    id, name, memberCount, role,
  }) => (
    <GroupTile
      key={id}
      name={name}
      memberCount={memberCount}
      position={role.charAt(0).toUpperCase() + role.slice(1)}
      selected={id === selectedGroupId}
      onClick={() => setSelectedGroupId(id)}
    />
  )));

  useEffect(() => {
    if (session !== undefined) {
      setGroups(session.user.groups);
    }
  }, [session]);

  return (
    <div className={styles.channelContainer} style={{ flex }}>
      <div className={styles.dividingLine} />
      <div className={styles.headerContainer}>
        <Link href="/groups">
          <span className={`${styles.headerText} ${styles.headerLink}`}>
            Groups
          </span>
        </Link>
        <NewButton href="/groups/new" />
      </div>
      <div className={styles.tileContainer}>
        {groupTiles}
      </div>

    </div>
  );
}

export function DocumentsChannel({
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

export function AnnotationsChannel({
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
  }) => (
    <AnnotationsTile
      key={_id}
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
          mine: sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'mine' })).map(toAnnotationsTile),
          shared: sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'shared' })).map(toAnnotationsTile),
          'shared-with-me': sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'shared-with-me' })).map(toAnnotationsTile),
        };
        setAnnotations(a);
        setListLoading();
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
