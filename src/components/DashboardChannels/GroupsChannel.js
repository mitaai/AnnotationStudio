import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GroupTile from './GroupTile';

import styles from './DashboardChannels.module.scss';
import TileBadge from '../TileBadge';
import SortChannelsIcon from './SortChannelsIcon';
import { getGroupsByGroupIds } from '../../utils/groupUtil';

export default function GroupsChannel({
  width,
  left,
  opacity,
  session,
  selectedGroupId,
  setSelectedGroupId,
  selectedDocumentId,
  selectedDocumentSlug,
  documentPermissions,
  setGroupMembers,
}) {
  const [groups, setGroups] = useState([]);
  const [groupsDates, setGroupsDates] = useState();
  const [selectedItem, setSelectedItem] = useState('by-date-created');
  const [asc, setAsc] = useState();
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;


  const sortGroups = (a, b) => {
    const order = asc ? -1 : 1;

    if (groupsDates) {
      if (selectedItem === 'by-date-created' && groupsDates[a.id]?.createdAt && groupsDates[b.id]?.createdAt) {
        if (groupsDates[a.id].createdAt > groupsDates[b.id].createdAt) {
          return -order;
        }
        return order;
      }
    }

    if (selectedItem === 'alpha') {
      if (a.name.toUpperCase() < b.name.toUpperCase()) {
        return -order;
      }
      return order;
    }

    return 0;
  };

  useEffect(() => {
    const groupIds = groups.map(({ id }) => id);
    getGroupsByGroupIds(groupIds)
      .then((res) => {
        const obj = {};
        const newGroupMembers = { privateGroup: [session.user] };
        res.map(({
          _id, createdAt, updatedAt, members,
        }) => {
          // eslint-disable-next-line no-underscore-dangle
          obj[_id] = { createdAt, updatedAt };
          // eslint-disable-next-line no-underscore-dangle
          newGroupMembers[_id] = members;
          return null;
        });
        setGroupMembers(newGroupMembers);
        setGroupsDates(obj);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  const groupTiles = [
    <GroupTile
      key="privateGroup"
      name="Personal"
      privateGroup
      position="Owner"
      selected={selectedGroupId === 'privateGroup'}
      onClick={() => setSelectedGroupId('privateGroup')}
    />,
  ].concat(groups.sort(sortGroups).map(({
    id, name, memberCount, role,
  }) => (
    <GroupTile
      key={id}
      id={id}
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
    <div
      className={styles.channelContainer}
      style={{
        width, left, opacity, minWidth: 300,
      }}
    >
      <div className={styles.dividingLine} />
      <div className={styles.headerContainer}>
        <Link href={`/groups?${dashboardState}`}>
          <span className={`${styles.headerText} ${styles.headerLink}`}>
            Groups
          </span>
        </Link>
        <div style={{ marginRight: 9, marginLeft: -2 }}>
          <SortChannelsIcon
            tooltipText="Sort Groups"
            selected={selectedItem}
            setSelected={() => setSelectedItem(selectedItem === 'by-date-created' ? 'alpha' : 'by-date-created')}
            asc={asc}
            setAsc={() => setAsc(!asc)}
          />
        </div>
        <TileBadge text="New +" href="/groups/new" color="yellow" />
      </div>
      <div className={styles.tileContainer}>
        {groupTiles}
      </div>

    </div>
  );
}
