/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import SortableHeader from '../../SortableHeader';

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
      style={{ borderCollapse: 'unset', display: 'flex', flexDirection: 'column' }}
    >
      <thead>
        <tr style={{ display: 'flex' }}>
          <SortableHeader
            field="name"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 7 }}
          >
            Name
          </SortableHeader>
          <SortableHeader
            field="owner"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 6 }}
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
          <th style={{ flex: 2 }}>Actions</th>
        </tr>
      </thead>
      <tbody style={{ overflowY: 'overlay' }} data-testid="admin-groups-table">
        {groups.map((group) => (
          <tr style={{ display: 'flex' }} key={group._id}>
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
