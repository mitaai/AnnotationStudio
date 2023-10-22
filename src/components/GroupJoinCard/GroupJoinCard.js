import React, { useState } from 'react';
import Router from 'next/router';
import { destroyCookie } from 'nookies';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import { addUserToGroup } from '../../utils/groupUtil';

const GroupJoinCard = ({
  groupId,
  session,
  updateSession,
  setAlerts,
  pageFrom,
  token,
}) => {
  const [visible, setVisible] = useState(true);
  return (
    <>
      {visible && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className={`text-center ${pageFrom === 'dashboard' ? 'mb-3' : ''}`}>
          <Card.Header>Join Group</Card.Header>
          <Card.Body>
            You have been invited to join a group.
            <br />
            <ButtonGroup>
              <Button
                className="mt-3"
                variant="outline-danger"
                onClick={() => {
                  destroyCookie(null, 'ans_grouptoken', {
                    path: '/',
                  });
                  Router.push('/');
                }}
              >
                Decline
              </Button>
              <Button
                className="mt-3"
                variant="outline-primary"
                onClick={() => {
                  addUserToGroup({ id: groupId }, session.user.email, token).then(({ group: g }) => {
                    const newGroupSession = {
                      user: {
                        name: session.user.name,
                        firstName: session.user.firstName,
                        email: session.user.email,
                        image: session.user.image,
                        id: session.user.id,
                        groups: [...session.user.groups, {
                          id: groupId,
                          memberCount: g.members.length,
                          name: g.name,
                          ownerName: g.ownerName,
                          role: 'member',
                        }],
                        role: session.user.role || 'user',
                      },
                      expires: session.expires,
                    };

                    updateSession(newGroupSession);

                    if (pageFrom === 'dashboard') {
                      destroyCookie(null, 'ans_grouptoken', {
                        path: '/',
                      });
                      setAlerts((prevState) => [...prevState, { text: 'Group successfully joined', variant: 'success' }]);
                      setVisible(false);
                    } else {
                      Router.push({
                        pathname: '/',
                        query: {
                          alert: 'joinedGroup',
                          statefulSession: newGroupSession,
                        },
                      });
                    }
                  }).catch((err) => {
                    setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                  });
                }}
              >
                Join Group
              </Button>
            </ButtonGroup>
          </Card.Body>
        </Card>
      )}
    </>
  );
};

export default GroupJoinCard;
