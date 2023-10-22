/* eslint-disable no-underscore-dangle */
import React, { useState } from 'react';
import Router from 'next/router';
import {
  Badge,
  Button,
  Dropdown,
  DropdownButton,
  Form,
  FormControl,
  InputGroup,
  Modal,
  Table,
} from 'react-bootstrap';
import * as yup from 'yup';
import { Formik } from 'formik';
import { format } from 'date-fns';
import AdminRoleBadge from '../../AdminRoleBadge';
import { getDocumentsByUser } from '../../../../utils/docUtil';
import { deleteUserById, changeUserRole } from '../../../../utils/userUtil';
import { reassignAnnotationsToUser } from '../../../../utils/annotationUtil';
import { adminGetList } from '../../../../utils/adminUtil';
import ConfirmationDialog from '../../../ConfirmationDialog';
import AdminAnnotation from './AdminAnnotation';
import GroupNameBadge from '../../../GroupNameBadge';

const AdminUserTable = ({
  user, setAlerts, isSelf,
}) => {
  const [docs, setDocs] = useState({});
  const [annotations, setAnnotations] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const handleCloseDeleteModal = () => setShowDeleteModal(false);
  const handleShowDeleteModal = () => setShowDeleteModal(true);

  const [showReassignModal, setShowReassignModal] = useState(false);
  const handleCloseReassignModal = () => setShowReassignModal(false);
  const handleShowReassignModal = () => setShowReassignModal(true);

  const handleChangeRole = async (role) => {
    await changeUserRole(user.id, role || 'member')
      .then(() => {
        Router.push({
          pathname: '/admin',
          query: {
            alert: 'userChangedRole',
            tab: 'users',
          },
        });
      })
      .catch((err) => setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]));
  };

  const fetchCreated = async (type) => {
    if (user) {
      const { id } = user;
      if (type === 'documents') {
        setDocs({
          found: await getDocumentsByUser({ id })
            .then((res) => res.docs)
            .catch((err) => setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }])),
        });
      } else if (type === 'annotations') {
        const params = `?userId=${id}`;
        setAnnotations(await adminGetList('annotations', params)
          .catch((err) => setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }])));
      }
    }
  };

  console.log("user::: ", user)

  return (
    <>
      <Table
        striped
        bordered
        hover
        size="sm"
        variant="light"
        style={{ borderCollapse: 'unset' }}
        data-testid="admin-user-view"
      >
        <thead>
          <tr>
            <td colSpan="2" className="text-center">View User</td>
            <td style={{ position: 'absolute', right: '2em', border: 'none' }} id="user-dropdown">
              <DropdownButton
                size="sm"
                variant="text"
                drop="down"
                title="Actions"
              >
                <Dropdown.Item eventKey="1" href={`/user/${user.slug}/editprofile`}>Modify user</Dropdown.Item>
                <Dropdown.Item eventKey="2" onClick={() => handleShowReassignModal()}>Reassign annotations</Dropdown.Item>
                {!isSelf && (
                  <>
                    {user.role !== 'admin' && (
                      <Dropdown.Item eventKey="3" onClick={() => handleChangeRole('admin')}>Promote to admin</Dropdown.Item>
                    )}
                    {user.role === 'admin' && (
                      <Dropdown.Item eventKey="4" onClick={() => handleChangeRole('user')}>Demote to user</Dropdown.Item>
                    )}
                    <Dropdown.Item eventKey="5" onClick={handleShowDeleteModal}>Delete user</Dropdown.Item>
                  </>
                )}
              </DropdownButton>
            </td>
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
            <td><AdminRoleBadge role={user.role || 'user'} /></td>
          </tr>
          <tr>
            <th>Registered</th>
            <td>{format(user?.createdAt ? new Date(user?.createdAt) : new Date(), 'PPPppp')}</td>
          </tr>
          <tr>
            <th>Updated</th>
            <td>{format(user?.updatedAt ? new Date(user?.updatedAt) : new Date(), 'PPPppp')}</td>
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
                      variant = 'info';
                      break;
                    default:
                      variant = 'secondary';
                      break;
                  }
                  return (
                    <GroupNameBadge
                      variant={variant}
                      className="mr-1"
                      href={`/admin/group/${group.id}`}
                      key={group.id}
                      groupName={group.name}
                    />
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
                  <Button type="button" key={doc._id} variant="link" size="sm" href={`/admin/document/${doc.slug}`}>
                    {doc.title}
                  </Button>
                ))
              )}
              {docs.found && docs.found.length === 0 && (
                <Button type="button" variant="text" size="sm" disabled>
                  This user has not created any documents.
                </Button>
              )}
              {!docs.found && (
                <Button type="button" variant="link" size="sm" onClick={() => { fetchCreated('documents'); }}>
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
        handleCloseModal={handleCloseDeleteModal}
        show={showDeleteModal}
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
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            });
          handleCloseDeleteModal();
        }}
      />
      <Modal
        show={showReassignModal}
        onHide={handleCloseReassignModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Reassign annotations
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Here you can reassign this user&apos;s annotations to another account.</p>
          <p>
            This may be useful if the user signed up with a different email address
            and wishes to migrate content to the new account.
          </p>
          <p>
            This action is irreversible, so make sure you have the permission of the user
            before doing so.
          </p>
          <Formik
            key="reassignAnnotations"
            validationSchema={yup.object({
              email: yup.string().required().email(),
            })}
            onSubmit={(values, actions) => {
              setTimeout(async () => {
                await reassignAnnotationsToUser(user, values.email).then((data) => {
                  if (data.matchedCount === 0) {
                    handleCloseReassignModal();
                    setAlerts((prevState) => [...prevState, { text: 'Unable to reassign annotations: none found for user', variant: 'danger' }]);
                  } else {
                    Router.push({
                      pathname: '/admin',
                      query: {
                        alert: 'userReassignedAnnotations',
                        tab: 'users',
                      },
                    });
                  }
                }).catch((err) => {
                  handleCloseReassignModal();
                  setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                });
                actions.setSubmitting(false);
              }, 1000);
            }}
            initialValues={{
              email: '',
            }}
          >
            {(props) => (
              <Form noValidate onSubmit={props.handleSubmit}>
                <Form.Group controlId="formPlaintextEmail">
                  <InputGroup>
                    <FormControl
                      placeholder="Destination user's email"
                      aria-label="Destination user's email"
                      name="email"
                      value={props.values.email}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      isValid={props.touched.email && !props.errors.email}
                      isInvalid={!!props.errors.email}
                    />
                    <InputGroup.Append>
                      <Button
                        variant="outline-secondary"
                        type="submit"
                        className="rounded-right"
                        disabled={props.isSubmitting || props.errors.email || props.values.email === ''}
                        data-testid="newgroup-submit-button"
                      >
                        Reassign
                      </Button>
                    </InputGroup.Append>
                    <Form.Control.Feedback type="invalid" className="w-100">
                      {props.errors.email}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
              </Form>
            )}
          </Formik>
        </Modal.Body>
      </Modal>
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
