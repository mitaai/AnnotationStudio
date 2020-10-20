/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import LoadingSpinner from '../../../LoadingSpinner';
import AdminRoleBadge from '../../AdminRoleBadge';

const AdminUserList = (props) => {
  const { users, loading } = props;
  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && users && (
        <Table
          striped
          bordered
          hover
          size="sm"
          variant="light"
          style={{ borderCollapse: 'unset' }}
          data-testid="admin-users-table"
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Affiliation</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={{ width: '16%' }}>
                  {user.name}
                </td>
                <td style={{ width: '14%' }}>
                  {user.email}
                </td>
                <td style={{ width: '14%' }}>
                  <AdminRoleBadge role={user.role} />
                </td>
                <td style={{ width: '14%' }}>
                  {user.affiliation}
                </td>
                <td style={{ width: '14%' }}>
                  {format(new Date(user.createdAt), 'MM/dd/yyyy')}
                </td>
                <td style={{ width: '14%' }}>
                  <Link href={`/admin/user/${user._id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminUserList;
