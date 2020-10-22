/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import Router from 'next/router';
import {
  Badge, Button, Dropdown, DropdownButton, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import AdminRoleBadge from '../../AdminRoleBadge';
import { getDocumentsByUser } from '../../../../utils/docUtil';
import { deleteUserById } from '../../../../utils/userUtil';
import { adminGetList } from '../../../../utils/adminUtil';
import ConfirmationDialog from '../../../ConfirmationDialog';
import AdminAnnotation from './AdminAnnotation';

const AdminUserTable = ({ user, alerts, setAlerts }) => {
  const [docs, setDocs] = useState({});
  const [annotations, setAnnotations] = useState({});

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const fetchCreated = async (type) => {
    if (user) {
      const { id } = user;
      if (type === 'documents') {
        setDocs({
          found: await getDocumentsByUser(id)
            .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }])),
        });
      } else if (type === 'annotations') {
        const params = `?userId=${id}`;
        setAnnotations(await adminGetList('annotations', params)
          .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }])));
      }
    }
  };

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
            <td colSpan="2" className="text-center">View User</td>
            <div style={{ position: 'absolute', right: '2em' }} id="user-dropdown">
              <DropdownButton
                size="sm"
                variant="text"
                drop="down"
                menuAlign="right"
                title="Actions"
              >
                <Dropdown.Item eventKey="1" href={`/user/${user.slug}/editprofile`}>Modify user</Dropdown.Item>
                <Dropdown.Item eventKey="2" disabled={user.role === 'admin'}>Promote to admin</Dropdown.Item>
                <Dropdown.Item eventKey="3" onClick={handleShowModal}>Delete user</Dropdown.Item>
              </DropdownButton>
            </div>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th style={{ width: '25%' }}>First Name</th>
            <td>{user.firstName}</td>
          </tr>
          <tr>
            <th>Last Name</th>
            <td>{user.lastName}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{user.email}</td>
          </tr>
          <tr>
            <th>Slug</th>
            <td>{user.slug}</td>
          </tr>
          <tr>
            <th>Affiliation</th>
            <td>{user.affiliation}</td>
          </tr>
          <tr>
            <th>Role</th>
            <td><AdminRoleBadge role={user.role} /></td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{format(new Date(user.createdAt), 'PPPppp')}</td>
          </tr>
          <tr>
            <th>Updated</th>
            <td>{format(new Date(user.updatedAt), 'PPPppp')}</td>
          </tr>
          <tr>
            <th>Last login</th>
            <td>{user.emailVerified && format(new Date(user.emailVerified), 'PPPppp')}</td>
          </tr>
          <tr>
            <th>Groups</th>
            <td>
              {(user.groups && user.groups.length > 0)
                ? user.groups.sort().map((group) => {
                  let variant;
                  switch (group.role) {
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
                      href={`/admin/group/${group.id}`}
                      key={group.id}
                    >
                      {group.name}
                    </Badge>
                  );
                })
                : (<Badge>[no groups]</Badge>)}
            </td>
          </tr>
          <tr>
            <th>Documents</th>
            <td>
              {docs.found && docs.found.length > 0 && (
                docs.found.map((doc) => (
                  <Button key={doc._id} variant="link" size="sm" href={`/admin/document/${doc.slug}`}>
                    {doc.title}
                  </Button>
                ))
              )}
              {docs.found && docs.found.length === 0 && (
                <Button variant="text" size="sm" disabled>
                  This user has not created any documents.
                </Button>
              )}
              {!docs.found && (
                <Button variant="link" size="sm" onClick={() => { fetchCreated('documents'); }}>
                  Click to fetch
                </Button>
              )}
            </td>
          </tr>
          <tr>
            <th>Annotations</th>
            <td>
              {annotations.found && annotations.found.length > 0 && (
                annotations.found.map((annotation) => (
                  <AdminAnnotation annotation={annotation} />
                ))
              )}
              {annotations.found && annotations.found.length === 0 && (
                <Button variant="text" size="sm" disabled>
                  This user has not created any annotations.
                </Button>
              )}
              {!annotations.found && (
                <Button variant="link" size="sm" onClick={() => { fetchCreated('annotations'); }}>
                  Click to fetch
                </Button>
              )}
            </td>
          </tr>
        </tbody>
      </Table>
      <ConfirmationDialog
        name={user.name}
        type="user"
        handleCloseModal={handleCloseModal}
        show={showModal}
        onClick={(event) => {
          event.target.setAttribute('disabled', 'true');
          deleteUserById(user.id)
            .then(() => {
              Router.push({
                pathname: '/admin',
                query: {
                  alert: 'deletedUser',
                  tab: 'users',
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
          #user-dropdown .dropdown-menu {
            right: 0 !important;
            left: auto !important;
          }
        `}
      </style>
    </>
  );
};

export default AdminUserTable;
