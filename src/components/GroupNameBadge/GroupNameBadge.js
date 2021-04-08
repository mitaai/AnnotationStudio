import { Badge, Button } from 'react-bootstrap';
import styles from './GroupNameBadge.module.scss';

const GroupNameBadge = ({
  variant,
  className,
  href,
  key,
  groupName,
}) => (href
  ? (
    <Badge
      variant={variant}
      as={Button}
      className={`${className} ${styles.groupbadge}`}
      href={href}
      key={key}
    >
      {groupName}
    </Badge>
  )
  : (
    <Badge
      variant={variant}
      className={`${className} ${styles.groupbadge}`}
      key={key}
    >
      {groupName}
    </Badge>
  ));

export default GroupNameBadge;
