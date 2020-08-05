import { useSession } from 'next-auth/client';
import Link from 'next/link';
import {
  Button, ButtonGroup, Card, Table,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, Plus,
} from 'react-bootstrap-icons';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import GroupRoleSummaries from '../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../components/GroupRoleBadge';
import { FirstNameLastInitial } from '../../utils/nameUtil';

const GroupList = () => {
  const [session, loading] = useSession();

  return (
    <Layout>
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
              {session.user.groups.length === 0 && (
              <>You are not a member of any groups.</>
              )}
              {session.user.groups.length > 0 && (
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
                  {session.user.groups.map((value) => (
                    <tr>
                      <td>
                        <Link href={`/groups/${value.id}`}>
                          {value.name}
                        </Link>
                      </td>
                      <td><GroupRoleBadge groupRole={value.role} /></td>
                      <td>{FirstNameLastInitial(value.ownerName)}</td>
                      <td>{value.memberCount}</td>
                      <td>
                        {(value.role === 'owner' || value.role === 'manager') && (
                        <ButtonGroup>
                          <Button variant="outline-primary" href={`/groups/${value.id}/edit`}>
                            <PencilSquare className="align-text-bottom mr-1" />
                            Manage
                          </Button>
                          {value.role === 'owner' && (
                            <Button variant="outline-danger">
                              <TrashFill className="align-text-bottom mr-1" />
                              Delete
                            </Button>
                          )}
                        </ButtonGroup>
                        )}
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

export default GroupList;
