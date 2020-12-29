/* eslint-disable jsx-a11y/anchor-is-valid */
import { useSession } from 'next-auth/client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Button, ButtonGroup, Card, Table,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, Plus, BoxArrowRight,
} from 'react-bootstrap-icons';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../components/GroupRoleBadge';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { deleteGroupById, removeUserFromGroup } from '../../utils/groupUtil';
import { getUserByEmail } from '../../utils/userUtil';
import { deepEqual } from '../../utils/objectUtil';

const GroupList = ({ query, initAlerts, statefulSession }) => {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts);
  const [pageLoading, setPageLoading] = useState(true);
  const [groups, setGroups] = useState([]);

  const [showModal, setShowModal] = useState('');
  const handleCloseModal = () => setShowModal('');
  const handleShowModal = (event) => {
    setShowModal(event.target.getAttribute('data-key'));
  };

  if (query.deletedGroupId && groups.some((g) => g.id === query.deletedGroupId)) {
    setGroups(groups.filter((g) => g.id !== query.deletedGroupId));
    setPageLoading(false);
  }

  React.useEffect(() => {
    if (session && !deepEqual(session.user.groups, groups)) {
      setGroups(session.user.groups);
      setPageLoading(false);
    }
  }, [session]);

  return (
    <Layout alerts={alerts} type="group" statefulSession={statefulSession}>
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
                              setPageLoading(true);
                              await getUserByEmail(session.user.email).then((user) => {
                                removeUserFromGroup(group, user).then(() => {
                                  setGroups(groups.filter((g) => g.id !== group.id));
                                  setAlerts([...alerts, {
                                    text: 'You have successfully left the group.',
                                    variant: 'warning',
                                  }]);
                                  setPageLoading(false);
                                });
                              }).catch((err) => {
                                setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
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
                                  setAlerts([...alerts, {
                                    text: 'You have successfully deleted the group.',
                                    variant: 'warning',
                                  }]);
                                  setPageLoading(false);
                                }).catch((err) => {
                                  setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
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
