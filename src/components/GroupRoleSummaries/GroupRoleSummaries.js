import React, { useContext } from 'react';
import {
  Accordion, AccordionContext, Button, Card, ListGroup, useAccordionToggle,
} from 'react-bootstrap';
import { ChevronDoubleDown, ChevronDoubleUp } from 'react-bootstrap-icons';

const ShowRolesToggle = ({ eventKey, callback }) => {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <Card.Header
      onClick={decoratedOnClick}
    >
      <Button
        type="button"
        variant="text"
        className="p-0"
      >
        {isCurrentEventKey && (
          <ChevronDoubleUp className="mb-1" />
        )}
        {!isCurrentEventKey && (
          <ChevronDoubleDown className="mb-1" />
        )}
        {' '}
        Group role permissions explained
      </Button>
    </Card.Header>
  );
};

const GroupRoleSummaries = () => (
  <Accordion>
    <Card className="mt-3" data-testid="group-roles-card">
      <ShowRolesToggle eventKey="group-roles" />
      <Accordion.Collapse eventKey="group-roles">
        <ListGroup data-testid="group-roles-list">
          <ListGroup.Item key="members">
            <strong>Members</strong>
            : Group Members can see documents and annotations shared with the group,
            and can annotate those documents. They can also see who else is in the group.
          </ListGroup.Item>
          <ListGroup.Item key="managers">
            <strong>Managers</strong>
            : Group Managers are Members who can also invite users to the group, remove
            users from the group, and change users&apos; roles between Manager and Member.
          </ListGroup.Item>
          <ListGroup.Item key="owners">
            <strong>Owners</strong>
            : Group Owners are Managers who can also delete the group.
          </ListGroup.Item>
        </ListGroup>
      </Accordion.Collapse>
    </Card>
  </Accordion>
);

export default GroupRoleSummaries;
