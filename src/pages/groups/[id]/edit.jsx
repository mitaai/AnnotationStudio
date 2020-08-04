import { useSession } from 'next-auth/client';
import {
  Button, Card, Col, Dropdown, FormControl, InputGroup, Row, Table,
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
                <Col sm={6}>
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
                          <td>
                            {member.role !== 'owner' && (
                              <Button variant="outline-danger">
                                <TrashFill className="align-text-bottom mr-1" />
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
                <Col>
                  <Row>
                    <h6>Invite link</h6>
                    <p>Generate an invite link to send to registered or new users.</p>
                    <Button variant="outline-secondary">
                      Generate
                    </Button>
                  </Row>
                  <Row>
                    <h6 className="mt-3">Add registered user</h6>
                    <p>
                      Automatically add a registered user to this group by entering
                      their email here.
                    </p>
                    <InputGroup>
                      <FormControl
                        aria-describedby="basic-addon1"
                        placeholder="User's email"
                        aria-label="User's email"
                      />
                      <InputGroup.Append>
                        <Button variant="outline-secondary">Add</Button>
                      </InputGroup.Append>
                    </InputGroup>
                  </Row>
                </Col>
                <Col>
                  <h6>Delete group</h6>
                  <p>
                    Delete this group permanently. This action cannot be undone.
                  </p>
                  <p>
                    Documents assigned to this group will not be deleted, but may
                    become inaccessible to group members.
                  </p>
                  {roleInGroup(session) === 'owner' && (
                    <Button variant="outline-danger">
                      <TrashFill className="align-text-bottom mr-1" />
                      Delete this group
                    </Button>
                  )}
                </Col>
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
