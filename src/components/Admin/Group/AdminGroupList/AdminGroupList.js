/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import SortableHeader from '../../SortableHeader';
import LoadingSpinner from '../../../LoadingSpinner';

const AdminGroupList = (props) => {
  const {
    groups,
    loading,
    loadMoreResults,
    sortState,
    setSortState,
    SortIcon,
  } = props;

  let content;
  let loadMoreResultsContent = null;
  if (loading) {
    content = <LoadingSpinner />;
  } else if (groups === undefined || groups.length === 0) {
    content = (
      <div style={{ textAlign: 'center', color: '#616161', marginTop: 10 }}>
        {groups ? '0 Search Results' : 'No Search'}
      </div>
    );
  } else {
    loadMoreResultsContent = loadMoreResults ? (
      <div
        onClick={loadMoreResults}
        style={{ textAlign: 'center', marginTop: 10, marginBottom: 10 }}
      >
        <span style={{ color: '#039be5', cursor: 'pointer' }}>Load More Results</span>
      </div>
    ) : null;
    content = groups.map((group) => (
      <Link key={group._id} href={`/groups/${group._id}`}>
        <tr style={{ display: 'flex', cursor: 'pointer' }} key={group._id}>
          <td style={{ width: '40%' }}>
            {group.name}
          </td>
          <td style={{ width: '35%' }}>
            {group.members.filter((member) => member.role === 'owner')[0].name}
          </td>
          <td style={{ width: '10%' }}>
            {group.members.length}
          </td>
          <td style={{ width: '15%' }}>
            {format(new Date(group.createdAt), 'MM/dd/yyyy')}
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
    >
      <thead>
        <tr style={{ display: 'flex' }}>
          <SortableHeader
            field="name"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 8, marginRight: 8 }}
          >
            Name
          </SortableHeader>
          <SortableHeader
            field="owner"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 7, marginRight: 10 }}
          >
            Owner
          </SortableHeader>
          <th style={{ flex: 2 }}>
            Members
          </th>
          <SortableHeader
            field="createdAt"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 3 }}
          >
            Created
          </SortableHeader>
        </tr>
      </thead>
      <tbody style={{ overflowY: 'overlay' }} data-testid="admin-groups-table">
        {content}
        {loadMoreResultsContent}
      </tbody>
    </Table>
  );
};

export default AdminGroupList;
