import { useState } from 'react';
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
  name, memberCount = 0, position = 'Member', selected, onClick, privateGroup,
}) {
  const [hovered, setHovered] = useState();
  const [focused, setFocused] = useState();
  const classNames = [
    styles.tile,
    selected ? styles.selectedTile : '',
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
  ].join(' ');
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
