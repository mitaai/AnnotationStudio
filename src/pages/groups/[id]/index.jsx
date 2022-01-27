import { useSession } from 'next-auth/client';
import { useState } from 'react';
import Router from 'next/router';
import {
  Button, ButtonGroup, Card, Table,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, BoxArrowRight,
} from 'react-bootstrap-icons';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import UnauthorizedCard from '../../../components/UnauthorizedCard';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../../components/GroupRoleBadge';
import { deleteGroup, removeUserFromGroup } from '../../../utils/groupUtil';
import { getUserByEmail } from '../../../utils/userUtil';
import { appendProtocolIfMissing } from '../../../utils/fetchUtil';

const ViewGroup = ({ group, statefulSession }) => {
  const [session, loading] = useSession();

  const [alerts, setAlerts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const roleInGroup = (currentSession) => {
    console.log('currentSession', currentSession);
    const groupInSession = currentSession.user.groups
      .find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === group.id));
    const memberInGroup = group.members
      .find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === currentSession.user.id));
    if (groupInSession || memberInGroup) {
      return groupInSession ? groupInSession.role : memberInGroup.role;
    }
    // if the user session is an admin we will give them all the privledges an owner of the group
    // would have
    return currentSession.user.role === 'admin' ? 'owner' : 'unauthorized';
  };

  return (
    <Layout
      alerts={alerts}
      type="group"
      title={group ? group.name : ''}
      document={group ? { title: group.name } : undefined}
      statefulSession={statefulSession}
    >
      <Card>
        {!session && loading && (
          <LoadingSpinner />
        )}
        {((!session && !loading) || (session && group && roleInGroup(session) === 'unauthorized')) && (
          <UnauthorizedCard />
        )}
        {session && !loading && group && (
          <>
            <Card.Header>
              {group.name}
            </Card.Header>
            <Card.Body data-testid="groupview-card-body">
              <Table striped bordered hover variant="light" data-testid="groupview-members-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((member) => (
                    <tr key={member.email}>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td><GroupRoleBadge groupRole={member.role} /></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <ButtonGroup data-testid="groupview-button-group">
                {(roleInGroup(session) === 'owner' || roleInGroup(session) === 'manager') && (
                  <Button variant="outline-primary" href={`${group.id}/edit`}>
                    <PencilSquare className="align-text-bottom mr-1" />
                    Manage this group
                  </Button>
                )}
                {(roleInGroup(session) === 'member' || roleInGroup(session) === 'manager') && (
                  <Button
                    variant="outline-danger"
                    onClick={async () => {
                      await getUserByEmail(session.user.email).then((user) => {
                        removeUserFromGroup(group, user).then(() => {
                          Router.push({
                            pathname: '/groups',
                            query: {
                              alert: 'leftGroup',
                              deletedGroupId: group.id,
                            },
                          }, '/groups');
                        });
                      }).catch((err) => {
                        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                      });
                    }}
                  >
                    <BoxArrowRight className="align-text-bottom mr-1" />
                    Leave this group
                  </Button>
                )}
                {roleInGroup(session) === 'owner' && (
                <>
                  <Button
                    variant="outline-danger"
                    type="button"
                    onClick={handleShowModal}
                  >
                    <TrashFill className="align-text-bottom mr-1" />
                    Delete this group
                  </Button>
                  <ConfirmationDialog
                    name={group.name}
                    type="group"
                    handleCloseModal={handleCloseModal}
                    show={showModal}
                    onClick={(event) => {
                      event.target.setAttribute('disabled', 'true');
                      deleteGroup(group).then(() => {
                        Router.push({
                          pathname: '/groups',
                          query: {
                            alert: 'deletedGroup',
                            deletedGroupId: group.id,
                          },
                        }, '/groups');
                      }).catch((err) => {
                        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                      });
                      handleCloseModal();
                    }}
                  />
                </>
                )}
              </ButtonGroup>
            </Card.Body>
          </>
        )}
      </Card>
      <GroupRoleSummaries />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  const url = `${appendProtocolIfMissing(process.env.SITE)}/api/group/${id}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: context.req.headers.cookie,
    },
  });
  if (res.status === 200) {
    const foundGroup = await res.json();
    const {
      name,
      members,
    } = foundGroup;
    const group = {
      id: context.params.id,
      name,
      members,
    };
    return {
      props: { group },
    };
  }
  return {
    props: { },
  };
}

export default ViewGroup;
