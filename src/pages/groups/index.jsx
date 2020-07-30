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
            <Card.Body>
              {session.user.groups.length === 0 && (
              <>You are not a member of any groups.</>
              )}
              {session.user.groups.length > 0 && (
              <Table striped bordered hover variant="light">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {session.user.groups.map((value) => (
                    <tr>
                      <td>
                        <Link href="#">
                          {value.name}
                        </Link>
                      </td>
                      <td>{value.role}</td>
                      <td>
                        <ButtonGroup>
                          <Button variant="outline-primary">
                            <PencilSquare className="align-text-bottom mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline-danger">
                            <TrashFill className="align-text-bottom mr-1" />
                            Delete
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              )}
            </Card.Body>
            <Card.Footer>
              <Button variant="primary" href="/groups/new">
                <Plus className="mr-1 ml-n1 mt-n1" />
                Create New Group
              </Button>
            </Card.Footer>
          </>
        )}
      </Card>
    </Layout>
  );
};

export default GroupList;
