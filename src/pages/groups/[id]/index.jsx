import { useSession } from 'next-auth/client';
import {
  Button, ButtonGroup, Card, Dropdown, Table,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill,
} from 'react-bootstrap-icons';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import GroupRoleSummaries from '../../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../../components/GroupRoleBadge';

const ViewGroup = ({ group }) => {
  const [session, loading] = useSession();

  const roleInGroup = (currentSession) => currentSession.user.groups.find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === group.id)).role;

  return (
    <Layout>
      <Card>
        {!session && loading && (
          <LoadingSpinner />
        )}
        {session && !loading && (
          <>
            <Card.Header>
              {group.name}
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover variant="light">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {group.members.map((member) => (
                    <tr>
                      <td>{member.name}</td>
                      <td>{member.email}</td>
                      <td>
                        {member.role === 'owner' && (
                          <GroupRoleBadge groupRole={member.role} />
                        )}
                        {member.role !== 'owner' && (
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-secondary">
                              {member.role}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item href="#/action-1">manager</Dropdown.Item>
                              <Dropdown.Item href="#/action-2">member</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {(roleInGroup(session) === 'owner' || roleInGroup(session) === 'manager') && (
                <ButtonGroup>
                  <Button variant="outline-primary" href={`${group.id}/edit`}>
                    <PencilSquare className="align-text-bottom mr-1" />
                    Edit this group
                  </Button>
                  {roleInGroup(session) === 'owner' && (
                    <Button variant="outline-danger">
                      <TrashFill className="align-text-bottom mr-1" />
                      Delete this group
                    </Button>
                  )}
                </ButtonGroup>
              )}
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

  const url = `${process.env.SITE}/api/group/${id}`;
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
