/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import { format } from 'date-fns';

const AdminGroupList = (props) => {
  const { groups } = props;
  return (
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
  );
};

export default AdminGroupList;
