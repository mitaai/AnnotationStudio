import {
  Badge, Button, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';

const AdminGroupTable = ({ group }) => (
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
        <td colSpan="2" className="text-center">View Group</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th style={{ width: '25%' }}>Name</th>
        <td>{group.name}</td>
      </tr>
      <tr>
        <th>Created</th>
        <td>{format(new Date(group.createdAt), 'PPPppp')}</td>
      </tr>
      <tr>
        <th>Updated</th>
        <td>{format(new Date(group.updatedAt), 'PPPppp')}</td>
      </tr>
      <tr>
        <th>Members</th>
        <td>
          {(group.members && group.members.length > 0)
            ? group.members.sort().map((member) => {
              let variant;
              switch (member.role) {
                case 'member':
                  variant = 'secondary';
                  break;
                case 'manager':
                  variant = 'warning';
                  break;
                case 'owner':
                  variant = 'primary';
                  break;
                default:
                  variant = 'secondary';
                  break;
              }
              return (
                <Badge
                  variant={variant}
                  className="mr-1"
                  as={Button}
                  href={`/admin/user/${member.id}`}
                  key={member.id}
                >
                  {member.name}
                </Badge>
              );
            })
            : (<Badge>[no groups]</Badge>)}
        </td>
      </tr>
    </tbody>
  </Table>
);

export default AdminGroupTable;
