import { Badge } from 'react-bootstrap';

const AdminRoleBadge = (props) => {
  let variant;
  const { role } = props;
  switch (role) {
    case 'user':
      variant = 'secondary';
      break;
    case 'admin':
      variant = 'danger';
      break;
    default:
      variant = 'secondary';
      break;
  }
  return (
    <Badge variant={variant} data-testid="admin-role-badge">
      {role || 'undefined'}
    </Badge>
  );
};

export default AdminRoleBadge;
