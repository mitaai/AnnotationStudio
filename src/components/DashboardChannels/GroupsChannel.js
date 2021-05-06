import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewButton } from './HelperComponents';
import GroupTile from './GroupTile';

import styles from './DashboardChannels.module.scss';

export default function GroupsChannel({
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
