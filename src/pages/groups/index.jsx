/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useSession } from 'next-auth/client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Button, ButtonGroup, Card,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, Plus, BoxArrowRight, InfoCircle, Search, PersonFill,
} from 'react-bootstrap-icons';
import styles from './index.module.scss';
import Layout from '../../components/Layout';
import Table from '../../components/Table';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../components/GroupRoleBadge';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { deleteGroupById, removeUserFromGroup } from '../../utils/groupUtil';
import { getUserByEmail } from '../../utils/userUtil';
import { deepEqual } from '../../utils/objectUtil';
import Paginator from '../../components/Paginator';
import TileBadge from '../../components/TileBadge';
import BadgeButton from '../../components/BadgeButton';
import PermissionsButtonGroup from '../../components/PermissionsButtonGroup';

const GroupList = ({ query, initAlerts, statefulSession }) => {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts);
  const [pageLoading, setPageLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const perPage = 8;

  const dashboardState = `${query.did !== undefined && query.slug !== undefined ? `did=${query.did}&slug=${query.slug}&dp=${query.dp}&` : ''}gid=${query.gid}`;

  const [showModal, setShowModal] = useState('');
  const handleCloseModal = () => setShowModal('');
  const handleShowModal = (event) => {
    setShowModal(event.target.getAttribute('data-key'));
  };

  if (query.deletedGroupId && groups.some((g) => g.id === query.deletedGroupId)) {
    const groupsToShow = groups.filter((g) => g.id !== query.deletedGroupId);
    setTotalPages(Math.ceil(groupsToShow.length / perPage));
    const start = (page - 1) * perPage;
    const end = page * perPage;
    setGroups(groupsToShow.slice(start, end));
  }

  const searchDisabled = false;

  useEffect(() => {
    if (session && (!session.user.groups
      || (Array.isArray(session.user.groups) && session.user.groups.length === 0))
    ) {
      setPageLoading(false);
    } else if (session && !deepEqual(session.user.groups, groups)) {
      const groupsToShow = session.user.groups;
      setTotalPages(Math.ceil(groupsToShow.length / perPage));
      const start = (page - 1) * perPage;
      const end = page * perPage;
      setGroups(groupsToShow.slice(start, end));
    }
  }, [session, page]);

  useEffect(() => {
    if (session && pageLoading) {
      setPageLoading(false);
    }
  }, [groups]);

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
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 200,
              height: 26,
              width: 26,
              borderRadius: 13,
              border: '1px solid #E0E0E0',
              backgroundColor: '#eeeeee',
              marginLeft: 11,
              cursor: 'pointer',
              marginRight: 'auto',
            }}
          >
            <span style={{ position: 'relative', top: -1 }}>+</span>
          </div>
          <PermissionsButtonGroup
            buttons={[
              {
                text: 'Active',
                textWidth: 50,
                count: 10,
                queryCount: undefined,
                selected: true,
                onClick: () => {},
                icon: <PersonFill size="1.2em" />,
              },
              {
                text: 'Archived',
                textWidth: 68,
                count: 0,
                queryCount: undefined,
                selected: false,
                onClick: () => {},
                icon: <PersonFill size="1.2em" />,
              },
            ]}
          />
        </div>
        <div
          className={styles.rolePermissionsText}
        >
          <InfoCircle size={14} style={{ marginRight: 4, position: 'relative', top: 0 }} />
          <span>Role permissions explained</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            height: 38,
            alignItems: 'center',
            borderRadius: 19,
            border: '1px solid #bdbdbd',
            backgroundColor: searchDisabled ? '#eeeeee' : '#fcfcfc',
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
                fontStyle: 'italic',
              }}
              placeholder="Search Groups"
            />
            <div style={{
              height: 36, width: 36, borderRadius: '0px 18px 18px 0px', backgroundColor: '#eeeeee', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            }}
            >
              <Plus size={20} color="#424242" style={{ transform: 'rotate(45deg)' }} />
            </div>
          </div>
        </div>
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
          rows={[
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
            {
              columns: [
                { content: '21L.015 Fall22', style: { fontWeight: 400 }, highlightOnHover: true },
                { content: 'Member', style: { color: '#86919D' } },
                { content: 'Joshua Mbogo', style: { color: '#86919D' } },
                { content: '39', style: { color: '#86919D' } },
                { content: '11/02/2021', style: { color: '#86919D' } },
              ],
              moreOptions: [
                { text: 'Manage', onClick: () => {} },
                { text: 'Delete', onClick: () => {} },
                { text: 'Archive', onClick: () => {} },
              ],
            },
          ]}
        />

      </div>

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
