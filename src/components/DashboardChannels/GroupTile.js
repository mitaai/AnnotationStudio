import { useEffect, useState } from 'react';
import $ from 'jquery';
import Router from 'next/router';
import {
  LockFill,
} from 'react-bootstrap-icons';
import { Dropdown } from 'react-bootstrap';
import TileBadge from '../TileBadge';
import {
  TilePointer, ThreeDotDropdown,
} from './HelperComponents';
import styles from './DashboardChannels.module.scss';

export default function GroupTile({
  id,
  name,
  memberCount = 0,
  position = 'Member',
  selected,
  onClick,
  privateGroup,
  moveGroupTileToList,
  archived,
}) {
  /*
    This variable can take on 3 values
      0:  means that the group tile hasn't been moved (no user actions yet)
      1:  means that the user wants to archive/unarchive the group
      2:  means it is in the process of archiving/unarchiving the group and nothing further needs to
          be done
  */
  const [removed, setRemoved] = useState(0);
  const [hovered, setHovered] = useState();
  const [focused, setFocused] = useState();
  const classNames = [
    styles.tile,
    selected ? styles.selectedTile : '',
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
    removed > 0 ? styles.tileRemoved : '',
  ].join(' ');
  const memberText = `${memberCount} member${(memberCount === 1 ? '' : 's')}`;
  const positionColors = {
    Member: 'grey',
    Manager: 'grey',
    Owner: 'green',
  };
  const color = positionColors[position] !== undefined ? positionColors[position] : 'grey';
  const tileBadge = <TileBadge color={color} text={position} />;
  const groupTileId = `group-tile-${id}`;

  useEffect(() => {
    if (removed === 1) {
      $(`#${groupTileId}`).css({ marginBottom: -($(`#${groupTileId}`).height() + 15) });
      moveGroupTileToList(archived, id);
      setRemoved(2);
    }
  }, [removed, archived, groupTileId, id, moveGroupTileToList]);

  return (
    <div
      id={groupTileId}
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
                  Router.push(`/groups/${id}`);
                } else if (eventKey === 'remove-from-list') {
                  setRemoved(1);
                }
              }}
            >
              <Dropdown.Toggle as={ThreeDotDropdown} id="dropdown-group-tile" />
              <Dropdown.Menu>
                <Dropdown.Item eventKey="manage">Manage</Dropdown.Item>
                <Dropdown.Item eventKey="remove-from-list">{archived ? 'Unarchive' : 'Archive'}</Dropdown.Item>
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
