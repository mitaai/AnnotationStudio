import { useSession } from 'next-auth/client';
import { Pencil, TrashFill } from 'react-bootstrap-icons';
import { useState, useRef } from 'react';
import {
  Button,
  Card,
  Col,
  Dropdown,
  FormControl,
  InputGroup,
  Overlay,
  Row,
  Table,
  Tooltip,
  Form,
} from 'react-bootstrap';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { Formik } from 'formik';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../../components/GroupRoleBadge';
import { StripQuery } from '../../../utils/stringUtil';
import {
  AddUserToGroup,
  ChangeUserRole,
  DeleteGroup,
  RemoveUserFromGroup,
  RenameGroup,
  GenerateInviteToken,
  DeleteInviteToken,
} from '../../../utils/groupUtil';


const EditGroup = ({ group }) => {
  const [session, loading] = useSession();

  const router = useRouter();

  const target = useRef(null);
  const [state, setState] = useState(
    { showModal: false, editingGroupName: false, showTooltip: false },
  );
  const handleCloseModal = () => setState({ ...state, showModal: false });
  const handleShowModal = () => setState({ ...state, showModal: true });
  const editGroupName = () => setState({ ...state, editingGroupName: true });
  const handleShowTooltip = () => setState({ ...state, showTooltip: true });
  const handleHideTooltip = () => setState({ ...state, showTooltip: false });

  const copyInviteUrl = () => {
    if (typeof navigator !== 'undefined') {
      // eslint-disable-next-line no-undef
      navigator.clipboard.writeText(group.inviteUrl);
      handleShowTooltip();
      target.current.focus();
      target.current.select();
    }
  };

  const roleInGroup = (currentSession) => currentSession.user.groups.find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === group.id)).role;

  return (
    <Layout>
      <Card>
        {!session && loading && (
          <LoadingSpinner />
        )}
        {session && !loading && (roleInGroup(session) === 'owner' || roleInGroup(session) === 'manager') && (
          <>
            <Card.Header>
              {!state.editingGroupName && (
                <>
                  Manage Group:
                  {' '}
                  {group.name}
                  <Button
                    type="button"
                    variant="link"
                    className="mb-1"
                    title="Edit name"
                    size="sm"
                    onClick={editGroupName}
                  >
                    <Pencil />
                  </Button>
                </>
              )}
              {state.editingGroupName && (
                <Formik
                  key="groupNameEditor"
                  validationSchema={yup.object({
                    groupName: yup.string().required('Group must have a name'),
                  })}
                  onSubmit={(values, actions) => {
                    setTimeout(() => {
                      RenameGroup(group, values.groupName);
                      actions.setSubmitting(false);
                    }, 1000);
                  }}
                  initialValues={{
                    groupName: group.name,
                  }}
                >
                  {(props) => (
                    <Form noValidate onSubmit={props.handleSubmit}>
                      <Form.Group controlId="formeditGroupName">
                        <InputGroup
                          className="mb-n3"
                        >
                          <FormControl
                            placeholder="Edit group name"
                            aria-label="Edit group name"
                            name="groupName"
                            value={props.values.groupName}
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            isValid={props.touched.groupName && !props.errors.groupName}
                            isInvalid={!!props.errors.groupName}
                          />
                          <InputGroup.Append>
                            <Button
                              variant="outline-primary"
                              type="submit"
                              className="rounded-right"
                              disabled={props.isSubmitting || props.errors.groupName || props.values.groupName === ''}
                              data-testid="newgroup-submit-button"
                            >
                              Save
                            </Button>
                          </InputGroup.Append>
                          <Form.Control.Feedback type="invalid" className="w-100">
                            {props.errors.groupName}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    </Form>
                  )}
                </Formik>
              )}
            </Card.Header>
            <Card.Body>
              <Row fluid="true">
                <Col lg={7}>
                  <Table striped bordered hover variant="light" size="sm">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.members.map((member) => (
                        <tr key={member.email}>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>
                            {member.role === 'owner' && (
                            <GroupRoleBadge groupRole={member.role} />
                            )}
                            {member.role !== 'owner' && (
                            <Dropdown>
                              <Dropdown.Toggle variant="outline-secondary" className="btn-sm">
                                {member.role}
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item
                                  disabled={member.role === 'member'}
                                  onClick={() => { ChangeUserRole(group, member, 'member'); }}
                                >
                                  member
                                </Dropdown.Item>
                                <Dropdown.Item
                                  disabled={member.role === 'manager'}
                                  onClick={() => { ChangeUserRole(group, member, 'manager'); }}
                                >
                                  manager
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            )}
                          </td>
                          <td>
                            {member.role !== 'owner' && (
                              <Button
                                variant="outline-danger"
                                className="btn-sm"
                                type="button"
                                onClick={() => RemoveUserFromGroup(group, member).then(() => {
                                  router.push({
                                    pathname: `/groups/${group.id}/edit`,
                                    query: {
                                      alert: 'removeUser',
                                    },
                                  });
                                }).catch((err) => {
                                  router.push({
                                    pathname: `/groups/${group.id}/edit`,
                                    query: {
                                      error: err.message,
                                    },
                                  });
                                })}
                              >
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
                <Col>
                  <Row>
                    <h6>Invite link</h6>
                    {group.inviteUrl === '' && (
                      <>
                        <p>Generate an invite link to send to registered or new users.</p>
                        <Button
                          variant="outline-secondary"
                          onClick={(event) => {
                            event.target.setAttribute('disabled', 'true');
                            GenerateInviteToken(group);
                          }}
                        >
                          Generate
                        </Button>
                      </>
                    )}
                    {group.inviteUrl !== '' && (
                      <>
                        <p>
                          Send this invite link to registered or
                          new users to add them to the group.  (If the link is not working,
                          you can
                          {' '}
                          <button
                            type="button"
                            className="btn btn-link"
                            size="sm"
                            style={{ padding: 0 }}
                            onClick={() => {
                              DeleteInviteToken(group).then(() => {
                                router.push(
                                  {
                                    pathname: StripQuery(router.asPath),
                                    query: { alert: 'deletedToken' },
                                  },
                                );
                              }).catch((err) => {
                                router.push(
                                  {
                                    pathname: StripQuery(router.asPath),
                                    query: { error: err.message },
                                  },
                                );
                              });
                            }}
                          >
                            click here to remove it
                          </button>
                          , then generate a new one.
                          The old link will no longer work.)
                        </p>
                        <InputGroup>
                          <FormControl
                            placeholder="Group invite link"
                            aria-label="Group invite link"
                            type="text"
                            name="inviteUrl"
                            ref={target}
                            value={group.inviteUrl}
                            onClick={copyInviteUrl}
                            readOnly
                          />
                          <InputGroup.Append>
                            <Button
                              variant="outline-secondary"
                              type="button"
                              className="rounded-right"
                              onClick={copyInviteUrl}
                            >
                              Copy
                            </Button>
                            <Overlay
                              target={target.current}
                              show={state.showTooltip}
                              placement="top"
                              rootClose
                              onHide={handleHideTooltip}
                              rootCloseEvent="click"
                            >
                              {(props) => (
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                <Tooltip id="overlay-example" {...props}>
                                  Copied!
                                </Tooltip>
                              )}
                            </Overlay>
                          </InputGroup.Append>
                        </InputGroup>
                      </>
                    )}
                  </Row>
                  <Row>
                    <h6 className="mt-3">Add registered user</h6>
                    <p>
                      Automatically add a registered user to this group by entering
                      their email here.
                    </p>
                    <Formik
                      key="addByEmail"
                      validationSchema={yup.object({
                        email: yup.string().required().email(),
                      })}
                      onSubmit={(values, actions) => {
                        setTimeout(() => {
                          AddUserToGroup(group, values.email, true).catch((err) => {
                            router.push(
                              {
                                pathname: StripQuery(router.asPath),
                                query: { error: err.message },
                              },
                            );
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
                                placeholder="User's email"
                                aria-label="User's email"
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
                                  Add
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

                  </Row>
                </Col>
                <Col>
                  <h6>Delete group</h6>
                  <p>
                    Delete this group permanently. This action cannot be undone.
                  </p>
                  <p>
                    Documents assigned to this group will not be deleted, but may
                    become inaccessible to group members.
                  </p>
                  {roleInGroup(session) === 'owner' && (
                    <>
                      <Button
                        variant="outline-danger"
                        type="button"
                        onClick={handleShowModal}
                      >
                        <TrashFill className="align-text-bottom mr-1" />
                        Delete this group
                      </Button>
                      <ConfirmationDialog
                        value={group}
                        type="deleteGroup"
                        handleCloseModal={handleCloseModal}
                        show={state.showModal}
                        onClick={(event) => {
                          event.target.setAttribute('disabled', 'true');
                          DeleteGroup(group);
                          handleCloseModal();
                        }}
                      />
                    </>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </>
        )}
      </Card>
      <GroupRoleSummaries />
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  const url = `${process.env.SITE}/api/group/${id}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: context.req.headers.cookie,
    },
  });
  if (res.status === 200) {
    const foundGroup = await res.json();
    const {
      name,
      members,
      inviteToken,
    } = foundGroup;
    const group = {
      id: context.params.id,
      name,
      members,
    };
    group.inviteToken = inviteToken || null;
    group.inviteUrl = inviteToken
      ? `${process.env.SITE}/auth/email-signin?callbackUrl=${process.env.SITE}&groupToken=${inviteToken}`
      : '';
    return {
      props: { group },
    };
  }
  return {
    props: { },
  };
}

export default EditGroup;
