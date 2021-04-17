import { useState, useEffect } from 'react';
import moment from 'moment';
import {
  LockFill,
  ThreeDotsVertical,
} from 'react-bootstrap-icons';
import TileBadge from '../TileBadge';
import { getSharedDocumentsByGroup, getDocumentsByUser, addGroupNamesToDocuments } from '../../utils/docUtil';
import styles from './DashboardChannels.module.scss';

function NewButton() {
  return (
    <span className={styles.newButton}>
      New +
    </span>
  );
}

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


export function GroupsChannel({ session, selectedGroupId, setSelectedGroupId }) {
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

export function DocumentsChannel({
  session, setAlerts, forceUpdate, selectedGroupId = 'privateGroup', selectedDocumentId, setSelectedDocumentId, maxNumberOfDocumentGroups = 3,
}) {
  const [key] = useState('shared');
  const [, setListLoading] = useState(true);
  const [documents, setDocuments] = useState({});

  const organizeDocumentsByGroup = (docs) => {
    const organizedDocs = {
      privateGroup: [],
    };
    for (let i = 0; i < docs.length; i += 1) {
      const docGroups = docs[i].groups;
      if (docGroups.length > 0) {
        for (let j = 0; j < docGroups.length; j += 1) {
          // eslint-disable-next-line no-underscore-dangle
          const groupId = docGroups[j]._id;
          // make sure that this id has an array that represents it
          if (organizedDocs[groupId] === undefined) {
            organizedDocs[groupId] = [];
          }
          // adding document to a group that it is in
          organizedDocs[groupId].push(docs[i]);
        }
      } else {
        // if the document has no groups it is attached to then it will go to the privateGroup
        organizedDocs.privateGroup.push(docs[i]);
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
                .then((docsWithGroupNames) => {
                  setDocuments(organizeDocumentsByGroup(docsWithGroupNames));
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

  const documentTiles = documents[selectedGroupId] === undefined
    ? []
    : documents[selectedGroupId].map(({
      _id, title, groups, contributors, updatedAt,
    }) => {
      const contributor = contributors.find(({ type }) => type.toLowerCase() === 'author');
      const author = contributor === undefined ? 'Author' : contributor.name;
      return (
        <DocumentTile
          key={_id}
          name={title}
          author={author}
          activityDate={updatedAt}
          selected={_id === selectedDocumentId}
          groups={groups}
          maxNumberOfDocumentGroups={maxNumberOfDocumentGroups}
          onClick={() => setSelectedDocumentId(_id)}
        />
      );
    });

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
