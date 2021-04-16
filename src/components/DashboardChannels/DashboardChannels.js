import { useState } from 'react';
import moment from 'moment';
import {
  LockFill,
  ThreeDotsVertical,
} from 'react-bootstrap-icons';
import TileBadge from '../TileBadge';
import styles from './DashboardChannels.module.scss';

function NewButton() {
  return (
    <span className={styles.newButton}>
      New +
    </span>
  );
}

function GroupTile({
  name, numberOfMembers = 0, position = 'Member', selected, onClick, private: privateGroup,
}) {
  const memberText = `${numberOfMembers} member${(numberOfMembers === 1 ? '' : 's')}`;
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
          : <ThreeDotsVertical className={styles.moreTileOptions} size={20} />}

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
  name, groups = [], author, selected, activityDate, maxNumberOfDocumentGroups, onClick,
}) {
  const [hovered, setHovered] = useState();
  let tileBadges = [];
  if (groups.length > maxNumberOfDocumentGroups) {
    const g = groups.slice();
    const indexOfSelectedGroup = groups.findIndex(({ selected: s }) => s);
    const selectedGroup = g.splice(indexOfSelectedGroup, 1)[0];
    tileBadges = [
      <TileBadge key="selectedGroup" color="blue" text={selectedGroup.name} />,
      <TileBadge key="moreGroups" color="grey" text={`+${g.length} more`} marginLeft={5} />,
    ];
  } else {
    tileBadges = groups.map(({ id, name: n, selected: s }, i) => <TileBadge key={id} color={s ? 'blue' : 'grey'} text={n} marginLeft={i > 0 ? 5 : 0} />);
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
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div className={styles.name}>{name}</div>
        <ThreeDotsVertical className={styles.moreTileOptions} size={20} />
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div style={{
          width: (selected || hovered) ? 42.5 : 0,
          transition: 'width 0.25s',
          overflow: 'hidden',
        }}
        >
          <TileBadge color="yellow" text="Open" marginRight={5} />
        </div>
        <div className={styles.memberText}>
          <span>{author}</span>
          <span className={styles.dotSeperator} />
          <span>{moment(activityDate).fromNow()}</span>
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
    tileBadges = tags.map((t, i) => <TileBadge color="grey" text={t} marginLeft={i > 0 ? 5 : 0} />);
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
          <span>{moment(activityDate).fromNow()}</span>
        </div>
        {tileBadges}
      </div>
    </div>
  );
}


export function GroupsChannel() {
  const [selectedGroup, setSelectedGroup] = useState();
  const groups = [
    {
      id: 'private', name: 'Private', private: true, position: 'Owner',
    },
    {
      id: '1', name: 'AS 4 Group', numberOfMembers: 8, position: 'Member',
    },
    {
      id: '2', name: 'CMS.356', numberOfMembers: 10, position: 'Member',
    },
    {
      id: '3', name: 'CMS.356', numberOfMembers: 10, position: 'Member',
    },
  ];

  const groupTiles = groups.map(({
    id, name, private: privateGroup, numberOfMembers, position,
  }) => (
    <GroupTile
      key={id}
      name={name}
      numberOfMembers={numberOfMembers}
      private={privateGroup}
      position={position}
      selected={id === selectedGroup}
      onClick={() => setSelectedGroup(id)}
    />
  ));

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>
          Groups
        </div>
        <NewButton />
      </div>
      <div className={styles.tileContainer}>
        {groupTiles}
      </div>

    </>
  );
}

export function DocumentsChannel({ maxNumberOfDocumentGroups = 3 }) {
  const [selectedDocument, setSelectedDocument] = useState();
  const documents = [
    {
      id: '1',
      name: 'International Covenant on Economic',
      author: 'Charles Dickens',
      activityDate: new Date(2018, 11, 24, 10, 33, 30, 0),
      groups: [{ id: '1', name: 'CMS.356', selected: true }, { id: '2', name: '21L.015' }, { id: '3', name: '21L.015' }, { id: '4', name: '21L.015' }],
    },
    {
      id: '2',
      name: 'International Covenant on Economic, Social and Cultural Rights ional Covenant on Economiial and Cultural Rights',
      author: 'Charles Dickens',
      activityDate: new Date(2018, 11, 24, 10, 33, 30, 0),
      groups: [{ id: '1', name: 'CMS.356', selected: true }, { id: '2', name: '21L.015' }, { id: '3', name: '21L.015' }, { id: '4', name: '21L.015' }],
    },
    {
      id: '3',
      name: 'International Covenant on Economic, Social and Cultural Rights ional Covenant on Economiial and Cultural Rights',
      author: 'Charles Dickens',
      activityDate: new Date(2018, 11, 24, 10, 33, 30, 0),
      groups: [{ id: '1', name: 'CMS.356', selected: true }, { id: '2', name: '21L.015' }, { id: '3', name: '21L.015' }, { id: '4', name: '21L.015' }],
    },
    {
      id: '4',
      name: 'International Covenant on Economic, Social and Cultural Rights ional Covenant on Economiial and Cultural Rights',
      author: 'Charles Dickens',
      activityDate: new Date(2018, 11, 24, 10, 33, 30, 0),
      groups: [{ id: '1', name: 'CMS.356', selected: true }, { id: '2', name: '21L.015' }, { id: '3', name: '21L.015' }, { id: '4', name: '21L.015' }],
    },
  ];

  const documentTiles = documents.map(({
    id, name, author, activityDate, groups,
  }) => (
    <DocumentTile
      key={id}
      name={name}
      author={author}
      activityDate={activityDate}
      selected={id === selectedDocument}
      groups={groups}
      maxNumberOfDocumentGroups={maxNumberOfDocumentGroups}
      onClick={() => setSelectedDocument(id)}
    />
  ));

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>
          Documents
        </div>
        <NewButton />
      </div>
      <div className={styles.tileContainer}>
        {documentTiles}
      </div>

    </>
  );
}

export function AnnotationsChannel({ maxNumberOfAnnotationTags = 3 }) {
  const annotations = [
    {
      id: '1',
      text: 'a very interesting way to look at these things is to first no think about them',
      author: 'Joshua Mbogo',
      annotation: 'I think it is intrguing the approach that the teacher is making here',
      activityDate: new Date(2018, 11, 24, 10, 33, 30, 0),
      tags: ['interesting', 'as4'],
    },
    {
      id: '2',
      text: 'a very interesting way to look at these things is to first no think about them, a very interesting way to look at these things is to first no think about them, a very interesting way to look at these things is to first no think about them',
      author: 'Joshua Mbogo',
      annotation: 'I think it is intrguing the approach that the teacher is making here',
      activityDate: new Date(2018, 11, 24, 10, 33, 30, 0),
      tags: ['interesting', 'as4'],
    },
  ];

  const annotationTiles = annotations.map(({
    id, text, author, annotation, activityDate, tags,
  }) => (
    <AnnotationsTile
      key={id}
      text={text}
      author={author}
      annotation={annotation}
      activityDate={activityDate}
      tags={tags}
      maxNumberOfAnnotationTags={maxNumberOfAnnotationTags}
    />
  ));

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.headerText}>
          Annotations
        </div>
      </div>
      {annotationTiles}
    </>
  );
}
