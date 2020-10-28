/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';

const AdminGroupList = (props) => {
  const {
    groups,
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
    >
      <thead>
        <tr>
          <th
            onClick={() => {
              setSortState({
                field: 'name',
                direction: sortState.direction === 'desc' ? 'asc' : 'desc',
              });
            }}
            style={{ cursor: 'pointer' }}
          >
            Name
            {' '}
            <SortIcon field="name" />
          </th>
          <th
            onClick={() => {
              setSortState({
                field: 'owner',
                direction: sortState.direction === 'desc' ? 'asc' : 'desc',
              });
            }}
            style={{ cursor: 'pointer' }}
          >
            Owner
            {' '}
            <SortIcon field="owner" />
          </th>
          <th>
            Members
          </th>
          <th
            onClick={() => {
              setSortState({
                field: 'createdAt',
                direction: sortState.direction === 'desc' ? 'asc' : 'desc',
              });
            }}
            style={{ cursor: 'pointer' }}
          >
            Created
            {' '}
            <SortIcon field="createdAt" />
          </th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody data-testid="admin-groups-table">
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
              <Link href={`/admin/group/${group._id}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AdminGroupList;
