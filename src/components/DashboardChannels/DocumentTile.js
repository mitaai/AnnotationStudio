import { useState } from 'react';
import Router from 'next/router';
import moment from 'moment';
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import TileBadge from '../TileBadge';
import {
  TilePointer, ThreeDotDropdown,
} from './HelperComponents';
import styles from './DashboardChannels.module.scss';

export default function DocumentTile({
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
