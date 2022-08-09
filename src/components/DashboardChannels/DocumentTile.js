/* eslint-disable no-underscore-dangle */
import { useState } from 'react';
import Router from 'next/router';
import moment from 'moment';
import {
  Dropdown, OverlayTrigger, Popover,
} from 'react-bootstrap';
import { Folder2Open } from 'react-bootstrap-icons';
import TileBadge from '../TileBadge';
import {
  TilePointer, ThreeDotDropdown,
} from './HelperComponents';
import styles from './DashboardChannels.module.scss';

export default function DocumentTile({
  documentTileId,
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
  dashboardState,
}) {
  const [hovered, setHovered] = useState();
  const [focused, setFocused] = useState();
  const [openButtonHovered, setOpenButtonHovered] = useState();
  const [showPopover, setShowPopover] = useState();

  const classNames = [styles.tile, styles.documentTile,
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
    tileBadges = tileBadges.concat(g.map((grp) => (grp
      ? (
        <TileBadge
          key={grp?._id}
          onClick={() => setSelectedGroupId(grp?._id)}
          color="grey"
          text={grp?.name}
          marginLeft={5}
        />
      ) : <></>
    )));
  }

  const openDocument = () => Router.push(`/documents/${slug}?${dashboardState}`);

  return (
    <div
      id={documentTileId}
      className={classNames}
      onClick={onClick}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered()}
      onMouseMove={() => {
        if (!hovered) {
          setHovered(true);
        }
      }}
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
          className={styles.documentOpenButtonContainer}
          style={openButtonHovered ? {
            background: '#FFFAEB',
            color: '#B18910',
          } : {}}
          onClick={() => openDocument()}
          onMouseOver={() => setOpenButtonHovered(true)}
          onMouseOut={() => setOpenButtonHovered()}
          onFocus={() => { setHovered(true); setOpenButtonHovered(true); setFocused(true); }}
          onBlur={() => { setHovered(); setFocused(); setOpenButtonHovered(); }}
          tabIndex={0}
          role="link"
          onKeyDown={(e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
              openDocument();
            }
          }}
        >
          <span>Open</span>
          <Folder2Open size={18} />
        </div>
        <div className={styles.documentContentContainer}>
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
                  Router.push(`/documents/${slug}/edit?${dashboardState}`);
                } else if (eventKey === 'manage') {
                  Router.push(`/documents?${dashboardState}`);
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
            <div className={styles.memberText}>
              <span>{author}</span>
              <span className={styles.dotSeperator} />
              <OverlayTrigger
                key="document-activity-date-tooltip"
                placement="bottom"
                onExited={() => setHovered()}
                overlay={(
                  <Popover
                    id="popover-basic"
                  >
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
      </div>

    </div>
  );
}
