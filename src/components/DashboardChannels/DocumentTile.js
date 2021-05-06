import { useState } from 'react';
import Router from 'next/router';
import moment from 'moment';
import {
  Dropdown, OverlayTrigger, Popover,
} from 'react-bootstrap';
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
  isOwner,
  selected,
  selectedGroupId,
  setSelectedGroupId,
  activityDate,
  maxNumberOfDocumentGroups,
  onClick,
}) {
  const [hovered, setHovered] = useState();
  const [focused, setFocused] = useState();
  const [showPopover, setShowPopover] = useState();

  const classNames = [styles.tile,
    selected ? styles.selectedTile : '',
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
  ].join(' ');

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
    tileBadges.push(<TileBadge
      key="moreGroups"
      showPopover={showPopover}
      setShowPopover={setShowPopover}
      popover={(
        <Popover id="more-groups-badge-popover">
          <Popover.Content>
            {g.map(({ _id, name: n }) => {
              const popoverOnClick = () => { setSelectedGroupId(_id); setShowPopover(); };
              return (
                <div
                  key={_id}
                  className={styles.moreGroupsOption}
                  onClick={popoverOnClick}
                  onKeyDown={(e) => {
                    if (e.code === 'Space' || e.code === 'Enter') {
                      popoverOnClick();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  {n}
                </div>
              );
            })}
          </Popover.Content>
        </Popover>
      )}
      color="grey"
      text={`+${g.length} more`}
      marginLeft={5}
    />);
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
      className={classNames}
      onClick={onClick}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered()}
      onFocus={() => { setHovered(true); setFocused(true); }}
      onBlur={() => { setHovered(); setFocused(); }}
      onKeyDown={(e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          onClick();
        }
      }}
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
        {isOwner && (
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
        )}

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
              <Popover id="popover-basic">
                <Popover.Content style={{ color: '#636363' }}>{moment(activityDate).format('LLLL')}</Popover.Content>
              </Popover>
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
