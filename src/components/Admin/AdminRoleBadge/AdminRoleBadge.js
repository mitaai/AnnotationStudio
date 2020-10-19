import { Badge } from 'react-bootstrap';

const GroupRoleBadge = (props) => {
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
      {role}
    </Badge>
  );
};

export default GroupRoleBadge;
