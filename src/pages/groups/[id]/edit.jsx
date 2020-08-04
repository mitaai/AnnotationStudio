import { useSession } from 'next-auth/client';
import {
  ButtonGroup, Row, Col, Button, Card, Table,
} from 'react-bootstrap';
import { TrashFill } from 'react-bootstrap-icons';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import GroupRoleSummaries from '../../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../../components/GroupRoleBadge';

const EditGroup = ({ group }) => {
  const [session, loading] = useSession();

  const roleInGroup = (currentSession) => currentSession.user.groups.find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === group.id)).role;

  return (
    <Layout>
      <Card>
        {!session && loading && (
          <LoadingSpinner />
        )}
        {session && !loading && (roleInGroup(session) === 'owner' || roleInGroup(session) === 'manager') && (
          <>
            <Card.Header>
              Editing Group:
              {' '}
              {group.name}
            </Card.Header>
            <Card.Body>
              <Row>
                <Col>
                  <Table striped bordered hover variant="light">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.members.map((member) => (
                        <tr>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td><GroupRoleBadge groupRole={member.role} /></td>
                          <td>
                            <ButtonGroup>
                              <Button variant="outline-danger">
                                <TrashFill className="align-text-bottom mr-1" />
                                Remove
                              </Button>
                            </ButtonGroup>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
                {roleInGroup(session) === 'owner' && (
                  <Col>
                    <Button variant="outline-danger">
                      <TrashFill className="align-text-bottom mr-1" />
                      Delete this group
                    </Button>
                  </Col>
                )}
              </Row>
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

export default EditGroup;
