/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useSession } from 'next-auth/client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button, ButtonGroup, Card, Spinner,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, Plus, BoxArrowRight, InfoCircle, Search, LockFill, ClipboardCheck, Archive,
} from 'react-bootstrap-icons';
import moment from 'moment';
import styles from './index.module.scss';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../components/GroupRoleBadge';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { deleteGroupById, getGroupsByGroupIds, removeUserFromGroup } from '../../utils/groupUtil';
import { getUserByEmail } from '../../utils/userUtil';
import { deepEqual } from '../../utils/objectUtil';
import Paginator from '../../components/Paginator';
import TileBadge from '../../components/TileBadge';
import BadgeButton from '../../components/BadgeButton';
import PermissionsButtonGroup from '../../components/PermissionsButtonGroup';
import NewPlusButton from '../../components/NewPlusButton';
import RolePermissionsModal from '../../components/RolePermissionsModal';
import { escapeRegExp } from '../../utils/stringUtil';

const GroupList = ({ query, initAlerts, statefulSession }) => {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts);
  const [pageLoading, setPageLoading] = useState(true);
  const [groupPermissions, setGroupPermissions] = useState('active');
  const [groups, setGroups] = useState([]);
  const [groupData, setGroupData] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [clearSearchHovered, setClearSearchHovered] = useState();

  const [showGroupRolePermissionsModal, setShowGroupRolePermissionsModal] = useState();

  const dashboardState = `${query.did !== undefined && query.slug !== undefined ? `did=${query.did}&slug=${query.slug}&dp=${query.dp}&` : ''}gid=${query.gid}`;
  const transition = 'all 0.5s';

  const permissionGroups = groupData ? groupData.filter(({ archive }) => (groupPermissions === 'active' ? !archive : archive)) : undefined;
  const queriedGroups = permissionGroups
    ? permissionGroups.filter(({ name }) => {
    // eslint-disable-next-line no-useless-escape
      const r = searchQuery ? new RegExp(`\.\*${escapeRegExp(searchQuery)}\.\*`, 'i') : new RegExp('\.\*', 'i');
      return name.search(r) !== -1;
    })
    : undefined;// .sort();

  useEffect(() => {
    if (!groups) { return; }

    const groupIds = groups.map(({ id }) => id);
    getGroupsByGroupIds(groupIds)
      .then((res) => {
        setGroupData([{ _id: 'privateGroup', name: 'Personal' }].concat(
          res.map((g) => ({
            ...g,
            role: g.members.find(({ id }) => id === session.user.id)?.role,
            owner: g.members.find(({ role }) => role === 'owner')?.name,
          })),
        ));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  useEffect(() => {
    if (session !== undefined) {
      setGroups(session.user.groups);
    }
  }, [session]);

  return (
    <Layout
      alerts={alerts}
      type="group"
      statefulSession={statefulSession}
      dashboardState={dashboardState}
      backgroundColor="#F5F5F5"
    >
      <div style={{ height: 'calc(100vh - 234px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontSize: 26, fontWeight: 300, marginBottom: 5, display: 'flex', flexDirection: 'row', alignItems: 'center',
        }}
        >
          <div>Groups</div>
          <NewPlusButton href="/groups/new" />
          <span style={{ flex: 1 }} />
          <PermissionsButtonGroup
            buttons={[
              {
                text: 'Active',
                textWidth: 50,
                count: groupPermissions === 'active' ? permissionGroups?.length : undefined,
                queryCount: groupPermissions === 'active' ? queriedGroups?.length : undefined,
                selected: groupPermissions === 'active',
                onClick: () => setGroupPermissions('active'),
                icon: <ClipboardCheck size="1.2em" />,
              },
              {
                text: 'Archived',
                textWidth: 68,
                count: groupPermissions === 'archive' ? permissionGroups?.length : undefined,
                queryCount: groupPermissions === 'archive' ? queriedGroups?.length : undefined,
                selected: groupPermissions === 'archive',
                onClick: () => setGroupPermissions('archive'),
                icon: <Archive size="1.2em" />,
              },
            ]}
          />
        </div>
        <div style={{ display: 'flex' }}>
          <span
            className={styles.rolePermissionsText}
            onClick={() => setShowGroupRolePermissionsModal(true)}
          >
            <InfoCircle size={14} style={{ marginRight: 4, position: 'relative', top: 0 }} />
            <span>Role permissions explained</span>
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{
            transition,
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            height: 38,
            alignItems: 'center',
            borderRadius: 8,
            border: `1px solid ${clearSearchHovered ? '#E20101' : '#bdbdbd'}`,
            backgroundColor: '#fcfcfc',
            marginBottom: 20,
          }}
          >
            <Search size={16} color="#424242" style={{ marginLeft: 14, marginRight: 8 }} />
            <input
              style={{
                flex: 1,
                height: 36,
                border: 'none',
                outline: 'none',
                padding: '0px 8px',
                backgroundColor: 'transparent',
                fontStyle: searchQuery.length > 0 ? 'normal' : 'italic',
              }}
              placeholder="Search Groups"
              onChange={(ev) => setSearchQuery(ev.target.value)}
              value={searchQuery}
            />
            <div
              style={{
                transition,
                cursor: 'pointer',
                height: 36,
                width: 36,
                borderRadius: '0px 8px 8px 0px',
                color: clearSearchHovered ? '#E20101' : '#424242',
                backgroundColor: clearSearchHovered ? '#FCECEB' : '#eeeeee',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={() => setClearSearchHovered(true)}
              onMouseLeave={() => setClearSearchHovered()}
              onClick={() => setSearchQuery('')}
            >
              <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
            </div>
          </div>
        </div>
        {queriedGroups ? (
          <Table
            key="groups-table"
            id="groups-table"
            height="100vh - 380px"
            columnHeaders={[
              { header: 'NAME', flex: 6 },
              { header: 'ROLE', flex: 3 },
              { header: 'OWNER', flex: 4 },
              { header: 'MEMBERS', flex: 2 },
              { header: 'CREATED', flex: 3 },
            ]}
            rows={queriedGroups.map(({
              _id, name, members, role, owner, createdAt,
            }) => ({
              key: `queried-groups-${_id}`,
              href: _id === 'privateGroup' ? undefined : `groups/${_id}`,
              columns: [
                {
                  content: _id === 'privateGroup'
                    ? (
                      <span style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <LockFill className={styles.privateGroupLock} size={16} />
                        <span style={{ fontWeight: 500 }}>Personal</span>
                      </span>
                    )
                    : name || 'undefined',
                  style: { fontWeight: 400 },
                  highlightOnHover: _id !== 'privateGroup',
                },
                { content: role || '-', style: { color: '#86919D' } },
                { content: owner || '-', style: { color: '#86919D' } },
                { content: members?.length || '-', style: { color: '#86919D' } },
                { content: (createdAt && moment(createdAt).format('MMM DD, YYYY')) || '-', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            }))}
          />
        ) : <Spinner />}

      </div>
      <RolePermissionsModal
        show={showGroupRolePermissionsModal}
        setShow={setShowGroupRolePermissionsModal}
      />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { alert } = context.query;
  let initAlerts = [];
  if (alert === 'leftGroup') {
    initAlerts = [{
      text: 'You have successfully left the group.',
      variant: 'warning',
    }];
  } else if (alert === 'deletedGroup') {
    initAlerts = [{
      text: 'You have successfully deleted the group.',
      variant: 'warning',
    }];
  }

  return {
    props: { query: context.query, initAlerts },
  };
}

export default GroupList;


/*
<Card>
        {((!session && loading) || (session && pageLoading)) && (
          <LoadingSpinner />
        )}
        {!session && !loading && (
          <UnauthorizedCard />
        )}
        {session && !loading && !pageLoading && (
          <>
            <Card.Header>
              <Card.Title className="float-left">
                Groups
              </Card.Title>
              <Button
                variant="outline-primary"
                size="sm"
                href="/groups/new"
                className="float-right"
                data-testid="grouplist-create-button"
              >
                <Plus className="mr-1 ml-n1 mt-n1" />
                Create New Group
              </Button>
            </Card.Header>
            <Card.Body data-testid="grouplist-card-body">
              {groups.length === 0 && (
              <>You are not a member of any groups.</>
              )}
              {groups.length > 0 && (
                <>
                  <Table striped bordered hover variant="light">
                    <thead>
                      <tr>
                        <th style={{ width: '39%' }}>Name</th>
                        <th>Role</th>
                        <th>Owner</th>
                        <th style={{ width: '10%' }}>Members</th>
                        <th style={{ width: '21%' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups.map((group) => (
                        <tr key={group.id}>
                          <td>
                            <Link href={`/groups/${group.id}`}>
                              <a title={group.name}>{group.name}</a>
                            </Link>
                          </td>
                          <td><GroupRoleBadge groupRole={group.role} /></td>
                          <td>{FirstNameLastInitial(group.ownerName)}</td>
                          <td>{group.memberCount}</td>
                          <td>
                            <ButtonGroup>
                              {(group.role === 'owner' || group.role === 'manager') && (
                              <Button variant="outline-primary" href={`/groups/${group.id}/edit`}>
                                <PencilSquare className="align-text-bottom mr-1" />
                                Manage
                              </Button>
                              )}
                              {(group.role === 'member' || group.role === 'manager') && (
                              <Button
                                variant="outline-danger"
                                onClick={async () => {
                                  setPageLoading(true);
                                  await getUserByEmail(session.user.email).then((user) => {
                                    removeUserFromGroup(group, user).then(() => {
                                      setGroups(groups.filter((g) => g.id !== group.id));
                                      setAlerts((prevState) => [...prevState, {
                                        text: 'You have successfully left the group.',
                                        variant: 'warning',
                                      }]);
                                      setPageLoading(false);
                                    });
                                  }).catch((err) => {
                                    setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                    setPageLoading(false);
                                  });
                                }}
                              >
                                <BoxArrowRight className="align-text-bottom mr-1" />
                                Leave
                              </Button>
                              )}
                              {group.role === 'owner' && (
                              <>
                                <Button
                                  variant="outline-danger"
                                  type="button"
                                  onClick={handleShowModal}
                                  data-key={group.id}
                                >
                                  <TrashFill
                                    data-key={group.id}
                                    className="align-text-bottom mr-1"
                                  />
                                  Delete
                                </Button>
                                <ConfirmationDialog
                                  name={group.name}
                                  type="group"
                                  handleCloseModal={handleCloseModal}
                                  show={showModal === group.id}
                                  onClick={(event) => {
                                    setPageLoading(true);
                                    event.target.setAttribute('disabled', 'true');
                                    deleteGroupById(group.id).then(() => {
                                      setGroups(groups.filter((g) => g.id !== group.id));
                                      setAlerts((prevState) => [...prevState, {
                                        text: 'You have successfully deleted the group.',
                                        variant: 'warning',
                                      }]);
                                      setPageLoading(false);
                                    }).catch((err) => {
                                      setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                      setPageLoading(false);
                                    });
                                    handleCloseModal();
                                  }}
                                />
                              </>
                              )}
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  <Paginator
                    page={page}
                    setPage={setPage}
                    totalPages={totalPages}
                  />
                </>
              )}
            </Card.Body>
          </>
        )}
      </Card>
      <GroupRoleSummaries />
*/
