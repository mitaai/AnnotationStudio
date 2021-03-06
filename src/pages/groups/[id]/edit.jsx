import { useSession } from 'next-auth/client';
import { Pencil, TrashFill } from 'react-bootstrap-icons';
import { useState, useRef, useEffect } from 'react';
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
import UnauthorizedCard from '../../../components/UnauthorizedCard';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import GroupRoleSummaries from '../../../components/GroupRoleSummaries';
import GroupRoleBadge from '../../../components/GroupRoleBadge';
import {
  addUserToGroup,
  changeUserRole,
  deleteGroup,
  removeUserFromGroup,
  renameGroup,
  generateInviteToken,
  deleteInviteToken,
} from '../../../utils/groupUtil';
import { appendProtocolIfMissing } from '../../../utils/fetchUtil';


const EditGroup = ({
  group,
  initAlerts,
  baseUrl,
  statefulSession,
}) => {
  const [session, loading] = useSession();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading === false) {
      setPageLoading(false);
    }
  }, [loading]);


  const [alerts, setAlerts] = useState(initAlerts || []);

  const router = useRouter();

  const target = useRef(null);
  const [state, setState] = useState({
    showModal: false,
    editingGroupName: false,
    showTooltip: false,
    groupName: group ? group.name : '',
    inviteUrl: group ? group.inviteUrl : '',
    members: group ? group.members : '',
  });
  const handleCloseModal = () => setState({ ...state, showModal: false });
  const handleShowModal = () => setState({ ...state, showModal: true });
  const editGroupName = () => setState({ ...state, editingGroupName: true });
  const handleShowTooltip = () => setState({ ...state, showTooltip: true });
  const handleHideTooltip = () => setState({ ...state, showTooltip: false });

  const copyInviteUrl = () => {
    if (typeof navigator !== 'undefined') {
      // eslint-disable-next-line no-undef
      navigator.clipboard.writeText(state.inviteUrl);
      handleShowTooltip();
      target.current.focus();
      target.current.select();
    }
  };

  const roleInGroup = (currentSession) => {
    const groupInSession = currentSession.user.groups.find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === group.id));
    const memberInGroup = group.members.find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === currentSession.user.id));
    if (groupInSession || memberInGroup) {
      return groupInSession ? groupInSession.role : memberInGroup.role;
    } return 'unauthorized';
  };

  return (
    <Layout
      alerts={alerts}
      type="group"
      document={group ? { title: group.name } : undefined}
      title={`Manage Group: ${group ? group.name : ''}`}
      statefulSession={statefulSession}
    >
      <Card>
        {((!session && loading) || (session && pageLoading)) && (
          <LoadingSpinner />
        )}
        {((!session && !loading) || (session && group && roleInGroup(session) === 'unauthorized')) && (
          <UnauthorizedCard />
        )}
        {session && !loading && !pageLoading && group
          && ((session.user && session.user.role === 'admin')
            || roleInGroup(session) === 'owner'
            || roleInGroup(session) === 'manager')
          && (
          <>
            <Card.Header>
              {!state.editingGroupName && (
                <>
                  Manage Group:
                  {' '}
                  {state.groupName}
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
                      setPageLoading(true);
                      renameGroup(group, values.groupName).then(() => {
                        setAlerts((prevState) => [...prevState, {
                          text: 'Group successfully renamed.',
                          variant: 'success',
                        }]);
                        setState({
                          ...state, editingGroupName: false, groupName: values.groupName,
                        });
                        setPageLoading(false);
                      }).catch((err) => {
                        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                        setPageLoading(false);
                      });
                      actions.setSubmitting(false);
                    }, 1000);
                  }}
                  initialValues={{
                    groupName: state.groupName,
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
            <Card.Body data-testid="groupedit-card-body">
              <Row fluid="true">
                <Col lg={7}>
                  <Table striped bordered hover variant="light" size="sm" data-testid="groupedit-members-table">
                    <thead>
                      <tr>
                        <th>Member</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.members.map((member, idx) => (
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
                                  onClick={() => {
                                    setPageLoading(true);
                                    changeUserRole(group, member, 'member').then(() => {
                                      const newArray = [...state.members];
                                      const newMember = { ...member, role: 'member' };
                                      newArray[idx] = newMember;
                                      setState({ ...state, members: newArray });
                                      setAlerts((prevState) => [...prevState, {
                                        text: 'User\'s role changed successfully.',
                                        variant: 'success',
                                      }]);
                                      setPageLoading(false);
                                    }).catch((err) => {
                                      setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                      setPageLoading(false);
                                    });
                                  }}
                                >
                                  member
                                </Dropdown.Item>
                                <Dropdown.Item
                                  disabled={member.role === 'manager'}
                                  onClick={() => {
                                    setPageLoading(true);
                                    changeUserRole(group, member, 'manager').then(() => {
                                      const newArray = [...state.members];
                                      const newMember = { ...member, role: 'manager' };
                                      newArray[idx] = newMember;
                                      setState({ ...state, members: newArray });
                                      setAlerts((prevState) => [...prevState, {
                                        text: 'User\'s role changed successfully.',
                                        variant: 'success',
                                      }]);
                                      setPageLoading(false);
                                    }).catch((err) => {
                                      setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                      setPageLoading(false);
                                    });
                                  }}
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
                                onClick={() => {
                                  setPageLoading(true);
                                  removeUserFromGroup(group, member).then(() => {
                                    const members = state.members.filter((val, i) => i !== idx);
                                    setState({ ...state, members });
                                    setAlerts((prevState) => [...prevState, {
                                      text: 'User successfully removed from group.',
                                      variant: 'warning',
                                    }]);
                                    setPageLoading(false);
                                  }).catch((err) => {
                                    setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                    setPageLoading(false);
                                  });
                                }}
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
                    {state.inviteUrl === '' && (
                      <>
                        <p>Generate an invite link to send to registered or new users.</p>
                        <Button
                          variant="outline-secondary"
                          onClick={(event) => {
                            setPageLoading(true);
                            event.target.setAttribute('disabled', 'true');
                            generateInviteToken(group).then((data) => {
                              const inviteUrl = `${baseUrl}/auth/signin?callbackUrl=${baseUrl}&groupToken=${data.value.inviteToken}`;
                              setState({ ...state, inviteUrl });
                              setAlerts((prevState) => [...prevState, {
                                text: 'Group invite token created successfully.',
                                variant: 'success',
                              }]);
                              setPageLoading(false);
                            }).catch((err) => {
                              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                              setPageLoading(false);
                            });
                          }}
                        >
                          Generate
                        </Button>
                      </>
                    )}
                    {state.inviteUrl !== '' && (
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
                              setPageLoading(true);
                              deleteInviteToken(group).then(() => {
                                setState({ ...state, inviteUrl: '' });
                                setAlerts((prevState) => [...prevState, {
                                  text: 'Group invite token deleted successfully.',
                                  variant: 'warning',
                                }]);
                                setPageLoading(false);
                              }).catch((err) => {
                                setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                setPageLoading(false);
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
                            value={state.inviteUrl}
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
                        setTimeout(async () => {
                          setPageLoading(true);
                          await addUserToGroup(group, values.email).then((data) => {
                            const { _id, name } = data[state.members.length].value;
                            const { email } = values;
                            const member = {
                              name, email, id: _id, role: 'member',
                            };
                            setState({ ...state, members: [...state.members, member] });
                            setAlerts((prevState) => [...prevState, {
                              text: 'User successfully added to group.',
                              variant: 'success',
                            }]);
                            actions.resetForm();
                            setPageLoading(false);
                          }).catch((err) => {
                            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                            setPageLoading(false);
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
                        data-testid="groupedit-delete-button"
                      >
                        <TrashFill className="align-text-bottom mr-1" />
                        Delete this group
                      </Button>
                      <ConfirmationDialog
                        name={group.name}
                        type="group"
                        handleCloseModal={handleCloseModal}
                        show={state.showModal}
                        onClick={(event) => {
                          setPageLoading(true);
                          event.target.setAttribute('disabled', 'true');
                          deleteGroup(group).then(() => {
                            router.push({
                              pathname: '/groups',
                              query: {
                                alert: 'deletedGroup',
                                deletedGroupId: group.id,
                              },
                            }, '/groups');
                          }).catch((err) => {
                            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                            setPageLoading(false);
                          });
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
  const { params, query } = context;
  const { id } = params;
  let initAlerts = [];

  if (query && query.alert === 'newGroup') {
    initAlerts = [{
      text: 'Group created successfully.',
      variant: 'success',
    }];
  }

  const url = `${appendProtocolIfMissing(process.env.SITE)}/api/group/${id}`;
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
      ? `${appendProtocolIfMissing(process.env.SITE)}/auth/signin?callbackUrl=${appendProtocolIfMissing(process.env.SITE)}&groupToken=${inviteToken}`
      : '';
    return {
      props: {
        group, initAlerts, baseUrl: appendProtocolIfMissing(process.env.SITE),
      },
    };
  }
  return {
    props: { },
  };
}

export default EditGroup;
