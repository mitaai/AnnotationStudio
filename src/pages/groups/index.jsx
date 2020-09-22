/* eslint-disable jsx-a11y/anchor-is-valid */
import { useSession } from 'next-auth/client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Button, ButtonGroup, Card, Table,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, Plus, BoxArrowRight,
} from 'react-bootstrap-icons';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../components/GroupRoleBadge';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { DeleteGroupFromId, RemoveUserFromGroup } from '../../utils/groupUtil';
import { GetUserByEmail } from '../../utils/userUtil';

const GroupList = ({ query, initAlerts }) => {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts);
  const [groups, setGroups] = useState([]);

  const [showModal, setShowModal] = useState('');
  const handleCloseModal = () => setShowModal('');
  const handleShowModal = (event) => {
    setShowModal(event.target.getAttribute('data-key'));
  };

  if (query.deletedGroupId && groups.some((g) => g.id === query.deletedGroupId)) {
    setGroups(groups.filter((g) => g.id !== query.deletedGroupId));
  }

  useEffect(() => {
    if (session) {
      setGroups(session.user.groups);
    }
  }, [session]);

  return (
    <Layout alerts={alerts}>
      <Card>
        {!session && loading && (
          <LoadingSpinner />
        )}
        {session && (
          <>
            <Card.Header>
              Groups
            </Card.Header>
            <Card.Body data-testid="grouplist-card-body">
              {groups.length === 0 && (
              <>You are not a member of any groups.</>
              )}
              {groups.length > 0 && (
              <Table striped bordered hover variant="light">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Owner</th>
                    <th>Members</th>
                    <th>Actions</th>
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
                              const user = await GetUserByEmail(session.user.email);
                              RemoveUserFromGroup(group, user).then(() => {
                                setGroups(groups.filter((g) => g.id !== group.id));
                                setAlerts([...alerts, {
                                  text: 'You have successfully left the group.',
                                  variant: 'warning',
                                }]);
                              }).catch((err) => {
                                setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
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
                              <TrashFill className="align-text-bottom mr-1" />
                              Delete
                            </Button>
                            <ConfirmationDialog
                              value={group}
                              type="deleteGroup"
                              handleCloseModal={handleCloseModal}
                              show={showModal === group.id}
                              onClick={(event) => {
                                event.target.setAttribute('disabled', 'true');
                                DeleteGroupFromId(group.id).then(() => {
                                  setGroups(groups.filter((g) => g.id !== group.id));
                                  setAlerts([...alerts, {
                                    text: 'You have successfully deleted the group.',
                                    variant: 'warning',
                                  }]);
                                }).catch((err) => {
                                  setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
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
              )}
            </Card.Body>
            <Card.Footer>
              <Button variant="primary" href="/groups/new" data-testid="grouplist-create-button">
                <Plus className="mr-1 ml-n1 mt-n1" />
                Create New Group
              </Button>
            </Card.Footer>
          </>
        )}
      </Card>
      <GroupRoleSummaries />
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
