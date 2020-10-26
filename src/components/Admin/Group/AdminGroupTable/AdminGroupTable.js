import React, { useState } from 'react';
import Router from 'next/router';
import {
  Badge, Button, Dropdown, DropdownButton, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import ConfirmationDialog from '../../../ConfirmationDialog';
import { deleteGroupById } from '../../../../utils/groupUtil';

const AdminGroupTable = ({ group, alerts, setAlerts }) => {
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  return (
    <>
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
            <div style={{ position: 'absolute', right: '2em' }} id="group-dropdown">
              <DropdownButton
                size="sm"
                variant="text"
                drop="down"
                menuAlign="right"
                title="Actions"
              >
                <Dropdown.Item eventKey="1" href={`/groups/${group.id}/edit`}>Modify group</Dropdown.Item>
                <Dropdown.Item eventKey="2" onClick={handleShowModal}>Delete group</Dropdown.Item>
              </DropdownButton>
            </div>
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
                : (<Badge>[no members]</Badge>)}
            </td>
          </tr>
        </tbody>
      </Table>
      <ConfirmationDialog
        name={group.name}
        type="group"
        handleCloseModal={handleCloseModal}
        show={showModal}
        onClick={(event) => {
          event.target.setAttribute('disabled', 'true');
          deleteGroupById(group.id)
            .then(() => {
              Router.push({
                pathname: '/admin',
                query: {
                  alert: 'deletedGroup',
                  tab: 'groups',
                },
              });
            }).catch((err) => {
              setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
            });
          handleCloseModal();
        }}
      />
      <style jsx global>
        {`
          #group-dropdown .dropdown-menu {
            right: 0 !important;
            left: auto !important;
          }
        `}
      </style>
    </>
  );
};

export default AdminGroupTable;
