/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import LoadingSpinner from '../../LoadingSpinner';

const AdminGroupList = (props) => {
  const { groups, loading } = props;
  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && groups && (
        <Table striped bordered hover size="sm" variant="light" style={{ borderCollapse: 'unset' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Members</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group._id}>
                <td style={{ width: '35%' }}>
                  {group.name}
                </td>
                <td style={{ width: '30%' }}>
                  {group.members.filter((member) => member.role === 'owner')[0].name}
                </td>
                <td style={{ width: '10%' }}>
                  {group.members.length}
                </td>
                <td style={{ width: '15%' }}>
                  {format(new Date(group.createdAt), 'MM/dd/yyyy')}
                </td>
                <td style={{ width: '10%' }}>
                  <Link href={`/admin/group/${group._id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminGroupList;
