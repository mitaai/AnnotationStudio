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
      style={{ borderCollapse: 'unset', display: 'flex', flexDirection: 'column' }}
      data-testid="admin-users-table"
    >
      <thead>
        <tr style={{ display: 'flex' }}>
          <SortableHeader
            field="name"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 11 }}
          >
            Name
          </SortableHeader>
          <SortableHeader
            field="email"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 11 }}
          >
            Email
          </SortableHeader>
          <SortableHeader
            field="role"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 7 }}
          >
            Role
          </SortableHeader>
          <SortableHeader
            field="affiliation"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 7 }}
          >
            Affiliation
          </SortableHeader>
          <SortableHeader
            field="createdAt"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 7 }}
          >
            Created
          </SortableHeader>
          <th style={{ flex: 7 }}>Actions</th>
        </tr>
      </thead>
      <tbody style={{ overflowY: 'overlay' }}>
        {users.map((user) => (
          <tr key={user._id} style={{ display: 'flex' }}>
            <td style={{ width: '22%' }}>
              {user.name}
            </td>
            <td style={{ width: '22%' }}>
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
