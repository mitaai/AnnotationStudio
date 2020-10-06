import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Button, Card, Col, ListGroup, Row,
} from 'react-bootstrap';
import GroupRoleBadge from '../../GroupRoleBadge';
import { deepEqual } from '../../../utils/objectUtil';

const DashboardGroupList = ({
  session,
}) => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (session && !deepEqual(session.user.groups, groups)) {
      setGroups(session.user.groups);
    }
  }, [session]);

  return (
    <Card>
      <Card.Header>
        <Card.Title><Link href="/groups">Groups</Link></Card.Title>
      </Card.Header>
      <ListGroup>
        {groups && groups.length === 0 && (
        <>You are not a member of any groups.</>
        )}
        {groups && groups.length > 0
          && groups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(
            (group) => (
              <ListGroup.Item>
                <Row>
                  <Col>
                    <Link href={`/groups/${group.id}`}>
                      {group.name}
                    </Link>
                  </Col>
                  <Col className="text-right">
                    <GroupRoleBadge groupRole={group.role} />
                  </Col>
                </Row>
              </ListGroup.Item>
            ),
          )}
        <ListGroup.Item style={{ fontWeight: 'bold' }}>
          <Link href="/groups">
            See all groups...
          </Link>
        </ListGroup.Item>
      </ListGroup>
      <Card.Footer className="text-right" style={{ borderTop: 0 }}>
        <Button
          size="sm"
          variant="outline-primary"
          href="/groups/new"
        >
          + Create new group
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default DashboardGroupList;
