/* eslint-disable jsx-a11y/anchor-is-valid */
import { useSession } from 'next-auth/client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Button, ButtonGroup, Card, Table,
} from 'react-bootstrap';
import {
  PencilSquare, TrashFill, Plus,
} from 'react-bootstrap-icons';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../components/GroupRoleBadge';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { DeleteGroupFromId } from '../../utils/groupUtil';

const GroupList = ({ query }) => {
  const [session, loading] = useSession();

  const [showModal, setShowModal] = useState('');
  const handleCloseModal = () => setShowModal('');
  const handleShowModal = (event) => {
    setShowModal(event.target.getAttribute('data-key'));
  };

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
                  {session.user.groups.map((value) => {
                    if (value.id !== query.deletedGroupId) {
                      return (
                        <tr key={value.id}>
                          <td>
                            <Link href={`/groups/${value.id}`}>
                              <a title={value.name}>{value.name}</a>
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
                                <>
                                  <Button
                                    variant="outline-danger"
                                    type="button"
                                    onClick={handleShowModal}
                                    data-key={value.id}
                                  >
                                    <TrashFill className="align-text-bottom mr-1" />
                                    Delete
                                  </Button>
                                  <ConfirmationDialog
                                    value={value}
                                    type="deleteGroup"
                                    handleCloseModal={handleCloseModal}
                                    show={showModal === value.id}
                                    onClick={(event) => {
                                      event.target.setAttribute('disabled', 'true');
                                      DeleteGroupFromId(value.id);
                                      handleCloseModal();
                                    }}
                                  />
                                </>
                              )}
                            </ButtonGroup>
                            )}
                          </td>
                        </tr>
                      );
                    } return null;
                  })}
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
  return {
    props: { query: context.query }, // will be passed to the page component as props
  };
}

export default GroupList;
