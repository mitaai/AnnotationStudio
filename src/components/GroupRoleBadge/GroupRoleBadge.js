import { Badge } from 'react-bootstrap';

const GroupRoleBadge = (args) => {
  let variant;
  switch (args.groupRole) {
    case 'member':
      variant = 'secondary';
      break;
    case 'manager':
      variant = 'warning';
      break;
    case 'owner':
      variant = 'info';
      break;
    default:
      variant = 'secondary';
      break;
  }
  return (
    <Badge variant={variant} data-testid="group-role-badge">
      {args.groupRole}
    </Badge>
  );
};

export default GroupRoleBadge;
