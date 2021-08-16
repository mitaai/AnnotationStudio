import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GroupTile from './GroupTile';

import styles from './DashboardChannels.module.scss';
import TileBadge from '../TileBadge';

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
}) {
  const [groups, setGroups] = useState([]);
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;

  const groupTiles = [
    <GroupTile
      key="privateGroup"
      name="Personal"
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
    <div
      className={styles.channelContainer}
      style={{
        width, left, opacity,
      }}
    >
      <div className={styles.dividingLine} />
      <div className={styles.headerContainer}>
        <Link href={`/groups?${dashboardState}`}>
          <span className={`${styles.headerText} ${styles.headerLink}`}>
            Groups
          </span>
        </Link>
        <TileBadge text="New +" href="/groups/new" color="yellow" />
      </div>
      <div className={styles.tileContainer}>
        {groupTiles}
      </div>

    </div>
  );
}
