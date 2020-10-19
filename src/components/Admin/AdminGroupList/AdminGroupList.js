/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import LoadingSpinner from '../../LoadingSpinner';

const AdminGroupList = (props) => {
  const { groups, loading } = props;
  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && groups && (
        <Table striped bordered hover size="sm" variant="light">
          <thead>
            <tr>
              <th>Name</th>
              <th>Owner</th>
              <th>Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group._id}>
                <td style={{ width: '40%' }}>
                  {group.name}
                </td>
                <td style={{ width: '35%' }}>
                  {group.members.filter((member) => member.role === 'owner')[0].name}
                </td>
                <td style={{ width: '15%' }}>
                  {group.members.length}
                </td>
                <td style={{ width: '10%' }}>
                  <Link href={`/admin/group/${group._id}`}>View</Link>
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
