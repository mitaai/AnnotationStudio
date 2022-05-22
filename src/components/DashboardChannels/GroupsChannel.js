import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowRepeat, PersonFill, Plus } from 'react-bootstrap-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import GroupTile from './GroupTile';
import {
  ListLoadingSpinner,
} from './HelperComponents';
import styles from './DashboardChannels.module.scss';
import SortChannelsIcon from './SortChannelsIcon';
import { DeepCopyObj } from '../../utils/docUIUtils';
import {
  getGroupsByGroupIds,
  archiveGroupById,
  unarchiveGroupbyId,
} from '../../utils/groupUtil';
import PermissionsButtonGroup from '../PermissionsButtonGroup';

export default function GroupsChannel({
  width,
  left,
  opacity,
  session,
  selectedGroupId,
  setSelectedGroupId,
  setGroupMembers,
  groupPermissions,
  setGroupPermissions,
  dashboardState,
}) {
  const router = useRouter();
  const [groups, setGroups] = useState();
  const [refresh, setRefresh] = useState();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [groupsDates, setGroupsDates] = useState();
  const [archivedGroups, setArchivedGroups] = useState();
  const [selectedItem, setSelectedItem] = useState('by-date-created');
  const [asc, setAsc] = useState();

  const moveGroupTileToList = (archived, groupId) => {
    if (archived) {
      // if the tile is archived then we want to unarchive the group
      unarchiveGroupbyId(groupId).then((res) => {
        // eslint-disable-next-line no-underscore-dangle
        const gid = res?.value?._id;
        if (gid) {
          setArchivedGroups({ ...archivedGroups, [gid]: false });
        }
      });
    } else {
      // else that means that the tile is not archived so we need to archive it
      archiveGroupById(groupId).then((res) => {
        // eslint-disable-next-line no-underscore-dangle
        const gid = res?.value?._id;
        if (gid) {
          setArchivedGroups({ ...archivedGroups, [gid]: true });
        }
      });
    }
  };

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

  let groupTiles = <ListLoadingSpinner />;
  let numberOfGroups = 0;
  if (archivedGroups) {
    const filteredGroups = groups.filter(({ id }) => (groupPermissions === 'archived' ? archivedGroups[id] : !archivedGroups[id]));
    numberOfGroups = filteredGroups.length;

    groupTiles = [
      <GroupTile
        key="privateGroup"
        name="Personal"
        privateGroup
        position="Owner"
        selected={selectedGroupId === 'privateGroup'}
        onClick={() => setSelectedGroupId('privateGroup')}
      />,
    ].concat(filteredGroups.sort(sortGroups).map(({
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
        moveGroupTileToList={moveGroupTileToList}
        archived={groupPermissions === 'archived'}
      />
    )));
  }

  const buttons = [
    {
      text: 'Active',
      textWidth: 50,
      count: groupPermissions === 'active' ? numberOfGroups : 0,
      selected: groupPermissions === 'active',
      onClick: () => { setGroupPermissions('active'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Archived',
      textWidth: 68,
      count: groupPermissions === 'archived' ? numberOfGroups : 0,
      selected: groupPermissions === 'archived',
      onClick: () => { setGroupPermissions('archived'); },
      icon: <PersonFill size="1.2em" />,
    },
  ];

  useEffect(() => {
    if (!groups) { return; }

    const groupIds = groups.map(({ id }) => id);
    getGroupsByGroupIds(groupIds)
      .then((res) => {
        const obj = {};
        const newGroupMembers = { privateGroup: [session.user] };
        const archivedGrps = {};
        res.map(({
          _id, createdAt, updatedAt, members, archive,
        }) => {
          // eslint-disable-next-line no-underscore-dangle
          obj[_id] = { createdAt, updatedAt };
          // eslint-disable-next-line no-underscore-dangle
          newGroupMembers[_id] = members;
          if (archive) {
            // eslint-disable-next-line no-underscore-dangle
            archivedGrps[_id] = true;
          }
          return null;
        });

        setGroupMembers(newGroupMembers);
        setGroupsDates(obj);
        setArchivedGroups(archivedGrps);
        if (refresh) {
          setRefresh();
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  useEffect(() => {
    if (session !== undefined) {
      setGroups(session.user.groups);
    }
  }, [session]);

  useEffect(() => {
    if (session !== undefined && refresh) {
      setArchivedGroups();
      setGroups(DeepCopyObj(session.user.groups));
      setLastUpdated(new Date());
    }
  }, [refresh, session]);

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
        <div style={{ marginRight: 2.5, marginLeft: 5 }}>
          <SortChannelsIcon
            tooltipText="Sort Groups"
            selected={selectedItem}
            setSelected={() => setSelectedItem(selectedItem === 'by-date-created' ? 'alpha' : 'by-date-created')}
            asc={asc}
            setAsc={() => setAsc(!asc)}
          />
        </div>
        <OverlayTrigger
          key="refresh-groups"
          placement="bottom"
          overlay={(
            <Tooltip
              style={{ position: 'relative', top: -6, left: -4 }}
              className="styled-tooltip bottom"
            >
              {`Refreshed ${moment(lastUpdated).fromNow()}`}
            </Tooltip>
          )}
        >
          <div
            className={styles.refreshButton}
            onClick={() => setRefresh(true)}
            onKeyDown={() => {}}
            tabIndex={-1}
            role="button"
          >
            <ArrowRepeat size={18} style={{ margin: 'auto 5px' }} />
          </div>
        </OverlayTrigger>
        <OverlayTrigger
          key="create-new-group"
          placement="bottom"
          overlay={(
            <Tooltip
              style={{ position: 'relative', top: -6, left: -4 }}
              className="styled-tooltip bottom"
            >
              New Group
            </Tooltip>
          )}
        >
          <div
            className={styles.addNewIcon}
            onClick={() => router.push({
              pathname: '/groups/new',
            })}
            onKeyDown={() => {}}
            tabIndex={-1}
            role="button"
          >
            <Plus size={20} />
          </div>
        </OverlayTrigger>
        <PermissionsButtonGroup buttons={buttons} />
      </div>
      <div className={styles.tileContainer}>
        {groupTiles}
      </div>

    </div>
  );
}
