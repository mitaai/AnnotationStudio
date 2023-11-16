/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import LoadingSpinner from '../../../LoadingSpinner';
import AdminRoleBadge from '../../AdminRoleBadge';
import SortableHeader from '../../SortableHeader';

const AdminUserList = (props) => {
  const {
    users,
    sortState,
    loading,
    loadMoreResults,
    setSortState,
    SortIcon,
  } = props;

  let content;
  let loadMoreResultsContent = null;
  if (loading) {
    content = <LoadingSpinner />;
  } else if (users === undefined || users.length === 0) {
    content = <div style={{ textAlign: 'center', color: '#616161', marginTop: 10 }}>
      {users ? '0 Search Results' : 'No Search'}
    </div>;
  } else {
    loadMoreResultsContent = loadMoreResults ? <div
    onClick={loadMoreResults}
    style={{ textAlign: 'center', marginTop: 10, marginBottom: 10 }}>
      <span style={{ color: '#039be5', cursor: 'pointer' }}>Load More Results</span>
    </div> : null;
    content = users.map((user) => (
      <Link key={user._id} href={`/admin/user/${user._id}`}>
        <tr style={{ display: 'flex', cursor: 'pointer' }}>
          <td style={{ width: '31%' }}>
            {user.name}
          </td>
          <td style={{ width: '30%' }}>
            {user.email}
          </td>
          <td style={{ width: '13%' }}>
            <AdminRoleBadge role={user.role || 'user'} />
          </td>
          <td style={{ width: '13%' }}>
            {user.affiliation}
          </td>
          <td style={{ width: '13%' }}>
            {format(new Date(user.createdAt || user.emailVerified || new Date()), 'MM/dd/yyyy')}
          </td>
        </tr>
      </Link>
    ));
  }

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
            style={{ flex: 31, marginRight: 8 }}
          >
            Name
          </SortableHeader>
          <SortableHeader
            field="email"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 30, marginRight: 10 }}
          >
            Email
          </SortableHeader>
          <SortableHeader
            field="role"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 13 }}
          >
            Type
          </SortableHeader>
          <SortableHeader
            field="affiliation"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 13 }}
          >
            Affiliation
          </SortableHeader>
          <SortableHeader
            field="createdAt"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 13 }}
          >
            Created
          </SortableHeader>
        </tr>
      </thead>
      <tbody style={{ overflowY: 'overlay' }}>
        {content}
        {loadMoreResultsContent}
      </tbody>
    </Table>
  );
};

export default AdminUserList;
