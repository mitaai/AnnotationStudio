/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import AdminRoleBadge from '../../AdminRoleBadge';
import SortableHeader from '../../SortableHeader';

const AdminUserList = (props) => {
  const {
    users,
    sortState,
    setSortState,
    SortIcon,
  } = props;

  return (
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
          <SortableHeader
            field="name"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
          >
            Name
          </SortableHeader>
          <SortableHeader
            field="email"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
          >
            Email
          </SortableHeader>
          <SortableHeader
            field="role"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
          >
            Role
          </SortableHeader>
          <SortableHeader
            field="affiliation"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
          >
            Affiliation
          </SortableHeader>
          <SortableHeader
            field="createdAt"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
          >
            Created
          </SortableHeader>
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
              <Link href={`/admin/user/${user._id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AdminUserList;
