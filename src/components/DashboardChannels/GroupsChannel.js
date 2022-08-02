import React, { useState, useEffect } from 'react';
import $ from 'jquery';
import {
  PersonFill,
} from 'react-bootstrap-icons';
import GroupTile from './GroupTile';
import {
  ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';
import styles from './DashboardChannels.module.scss';
import { DeepCopyObj } from '../../utils/docUIUtils';
import {
  getGroupsByGroupIds,
  archiveGroupById,
  unarchiveGroupbyId,
} from '../../utils/groupUtil';
import PermissionsButtonGroup from '../PermissionsButtonGroup';
import ChannelHeader from './ChannelHeader';
import { escapeRegExp } from '../../utils/stringUtil';
import { useWindowSize } from '../../utils/customHooks';

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
  const [groups, setGroups] = useState();
  const [refresh, setRefresh] = useState();
  const [, setLastUpdated] = useState(new Date());
  const [groupsDates, setGroupsDates] = useState();
  const [archivedGroups, setArchivedGroups] = useState();
  const [selectedItem, setSelectedItem] = useState('by-date-created');
  const [asc, setAsc] = useState();
  const [searchQuery, setSearchQuery] = useState();

  const size = useWindowSize();

  console.log('size', size);

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

  const queryGroups = ({ name }) => {
    if (searchQuery) {
      // eslint-disable-next-line no-useless-escape
      const r = searchQuery ? new RegExp(`\.\*${escapeRegExp(searchQuery)}\.\*`, 'i') : new RegExp('\.\*', 'i');
      return name.search(r) !== -1;
    }
    return true;
  };

  let groupTiles = <ListLoadingSpinner />;
  let rawGroupTiles;
  let numberOfGroups = 0;
  let numberOfQueriedGroups;
  if (archivedGroups) {
    const filteredGroups = groups.filter(({ id }) => (groupPermissions === 'archived'
      ? archivedGroups[id]
      : !archivedGroups[id]));
    const includePersonalGroup = groupPermissions === 'active';
    const includePersonalGroupInQuery = includePersonalGroup && queryGroups({ name: 'Personal' });
    const seachQueryGroups = filteredGroups.filter(queryGroups);

    numberOfGroups = filteredGroups.length + (includePersonalGroup ? 1 : 0);
    numberOfQueriedGroups = seachQueryGroups.length + (includePersonalGroupInQuery ? 1 : 0);

    rawGroupTiles = ((
      includePersonalGroupInQuery && [{
        id: 'privateGroup', name: 'Personal', isPrivateGroup: true, role: 'owner',
      }]
    ) || []).concat(seachQueryGroups.sort(sortGroups));

    // Personal Psuedo group will only be apart of the active groups not archived
    groupTiles = rawGroupTiles.map(({
      id, name, memberCount, role, isPrivateGroup,
    }) => (
      <GroupTile
        key={id}
        id={id}
        groupTileId={`group-tile-${id}`}
        name={name}
        memberCount={memberCount}
        privateGroup={isPrivateGroup}
        position={role.charAt(0).toUpperCase() + role.slice(1)}
        selected={id === selectedGroupId}
        onClick={() => setSelectedGroupId(id)}
        moveGroupTileToList={moveGroupTileToList}
        archived={groupPermissions === 'archived'}
      />
    ));
  }

  if (groupTiles.length === 0) {
    groupTiles = <EmptyListMessage text="0 Search Results" />;
  }

  const buttons = [
    {
      text: 'Active',
      textWidth: 50,
      count: groupPermissions === 'active' ? numberOfGroups : 0,
      queryCount: groupPermissions === 'active' && searchQuery !== undefined
        ? numberOfQueriedGroups
        : undefined,
      selected: groupPermissions === 'active',
      onClick: () => { setGroupPermissions('active'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Archived',
      textWidth: 68,
      count: groupPermissions === 'archived' ? numberOfGroups : 0,
      queryCount: groupPermissions === 'archived' && searchQuery !== undefined
        ? numberOfQueriedGroups
        : undefined,
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
      <div className={styles.headerContainer} style={{ marginBottom: 0 }}>
        <ChannelHeader
          setRefresh={setRefresh}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          asc={asc}
          setAsc={setAsc}
          headerText="Groups"
          createNewText="New Group"
          createNewHref="/groups/new"
          searchPlaceholderText="Search Group Titles"
          headerTextWidth={70}
          headerLink={`/groups?${dashboardState}`}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        <PermissionsButtonGroup buttons={buttons} />
      </div>
      <div
        id="groups-channel-tile-container"
        className={styles.tileContainer}
        style={{ paddingTop: 25 }}
        onScroll={() => {
          if (rawGroupTiles) {
            rawGroupTiles.map(({ id }) => {
              const groupTile = $(`#group-tile-${id}`);
              if (groupTile) {
                const threshold = 66;
                const stage1Height = 25;
                const { top } = groupTile.position();

                if (top < threshold - stage1Height) {
                  const h = groupTile.height();
                  const percentage = ((threshold - stage1Height) - top) / h;
                  if (percentage <= 1) {
                    groupTile.css(
                      '-webkit-mask-image',
                      `-webkit-linear-gradient(rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) ${percentage * 100}%, rgba(0, 0, 0, ${1 - percentage}) 100%)`,
                    );
                  }
                } else if (top < threshold) {
                  const percentage = (threshold - top) / stage1Height;
                  groupTile.css(
                    '-webkit-mask-image',
                    `-webkit-linear-gradient(rgba(0, 0, 0, ${1 - percentage}) 0%, rgba(0, 0, 0, 1) 100%)`,
                  );
                } else {
                  groupTile.css('-webkit-mask-image', 'none');
                }
              }

              return null;
            });
          }
        }}
      >
        {groupTiles}
      </div>
    </div>
  );
}
