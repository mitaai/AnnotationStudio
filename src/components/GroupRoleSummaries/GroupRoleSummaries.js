import { Card, ListGroup } from 'react-bootstrap';

const GroupRoleSummaries = () => (
  <Card className="mt-3" data-testid="group-roles-card">
    <Card.Header>
      Group role permissions explained
    </Card.Header>
    <ListGroup data-testid="group-roles-list">
      <ListGroup.Item>
        <strong>Members</strong>
        : Group Members can see documents and annotations shared with the group,
        and can annotate those documents. They can also see who else is in the group.
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Managers</strong>
        : Group Managers are Members who can also invite users to the group, remove
        users from the group, and change users&apos; roles between Manager and Member.
      </ListGroup.Item>
      <ListGroup.Item>
        <strong>Owners</strong>
        : Group Owners are Managers who can also delete the group.
      </ListGroup.Item>
    </ListGroup>
  </Card>
);

export default GroupRoleSummaries;
