/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useSession } from 'next-auth/react';
import Router from 'next/router';
import $ from 'jquery';
import {
  Check,
  ChevronCompactRight,
  InfoCircle,
  Pencil,
  PencilFill,
  Plus,
  Search,
  X,
  Trash,
} from 'react-bootstrap-icons';
import { useState, useRef, useEffect } from 'react';
import { debounce } from 'lodash';
import {
  Button,
  Modal,
  Spinner,
} from 'react-bootstrap';

import { getUserByEmail } from '../../../utils/userUtil';
import Layout from '../../../components/Layout';
import Table from '../../../components/Table';
import RolePermissionsModal from '../../../components/RolePermissionsModal';

import {
  addUserToGroup,
  changeUserRole,
  deleteGroup,
  removeUserFromGroup,
  renameGroup,
  generateInviteToken,
  deleteInviteToken,
  roleInGroup,
} from '../../../utils/groupUtil';
import { appendProtocolIfMissing } from '../../../utils/fetchUtil';
import styles from './index.module.scss';
import TextDropdown from '../../../components/TextDropdown';
import { copyToClipboard } from '../../../utils/docUIUtils';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { escapeRegExp } from '../../../utils/stringUtil';
import { useWindowSize } from '../../../utils/customHooks';


const EditGroup = ({
  group,
  initAlerts,
  baseUrl,
  statefulSession,
}) => {
  // eslint-disable-next-line no-unused-vars
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const windowSize = useWindowSize();
  const [alerts, setAlerts] = useState(initAlerts || []);
  const [canEditGroup, setCanEditGroup] = useState();

  const [minimize, setMinimize] = useState();
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState();

  const [showGroupRolePermissionsModal, setShowGroupRolePermissionsModal] = useState();

  const [clearSearchHovered, setClearSearchHovered] = useState();
  const [searchQuery, setSearchQuery] = useState('');

  const [generatedInviteLink, setGeneratedInviteLink] = useState(group?.inviteUrl);
  const [generatingInviteLink, setGeneratingInviteLink] = useState();
  const [deletingInviteLink, setDeletingInviteLink] = useState();

  const [userEmailQuery, setUserEmailQuery] = useState('');
  // 0 -> found
  // 1 -> not found
  // 2 -> waiting
  const [userEmailFound, setUserEmailFound] = useState(2);
  const [userData, setUserData] = useState();

  const [editGroupName, setEditGroupName] = useState();
  const [groupName, setGroupName] = useState(group ? group.name : 'undefined');
  const [newGroupName, setNewGroupName] = useState();
  const [groupMembers, setGroupMembers] = useState(group?.members);
  const [saveGroupNameHovered, setSaveGroupNameHovered] = useState();
  const [cancelGroupNameHovered, setCancelGroupNameHovered] = useState();
  const [groupNameWidth, setGroupNameWidth] = useState();
  const [newGroupNameWidth, setNewGroupNameWidth] = useState();

  const [rowDeleteHovered, setRowDeleteHovered] = useState();

  const debouncedFunction = useRef(
    debounce((func) => func(), 1500),
  ).current;

  const deleteMember = (member) => {
    removeUserFromGroup(group, member).then(() => {
      setGroupMembers(groupMembers.filter(({ id }) => id !== member.id));
      setAlerts((prevState) => [...prevState, {
        text: 'User successfully removed from group.',
        variant: 'warning',
      }]);
    }).catch((err) => {
      setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
    });
  };

  const transition = 'all 0.5s';
  const border = '1px solid #dddddd';
  const inviteLinkContainerWidth = windowSize.isMobilePhone ? windowSize.width - 20 : 450;
  const states = {
    default: {
      desktopView: {
        leftPanel: {
          opacity: 1,
          left: 0,
          width: `calc(100vw - ${inviteLinkContainerWidth}px)`,
        },
        rightPanel: {
          opacity: 1,
          left: `calc(100vw - ${inviteLinkContainerWidth}px)`,
          width: inviteLinkContainerWidth,
        },
        chevron: {
          opacity: 1,
          left: `calc(100vw - ${inviteLinkContainerWidth}px - 20px)`,
          transform: 'rotate(-45deg)',
        },
        chevronSpan: {
          opacity: 1,
          top: 3,
          left: 6,
          transform: 'rotate(45deg)',
        },
      },
      mobileView: {
        leftPanel: {
          opacity: 1,
          left: 0,
          width: 'calc(100vw - 20px)',
        },
        rightPanel: {
          opacity: 1,
          left: `calc(100vw - ${inviteLinkContainerWidth}px)`,
          width: inviteLinkContainerWidth,
        },
        chevron: {
          opacity: 1,
          left: `calc(100vw - ${inviteLinkContainerWidth}px - 20px)`,
          transform: `rotate(${windowSize.isMobilePhone ? 135 : -45}deg)`,
          backgroundColor: windowSize.isMobilePhone ? 'white' : undefined,
        },
        chevronSpan: {
          opacity: 1,
          top: windowSize.isMobilePhone ? 5 : 3,
          left: 6,
          transform: `rotate(${windowSize.isMobilePhone ? -135 : 45}deg)`,
        },
      },
    },
    minimize: {
      desktopView: {
        leftPanel: {
          opacity: 1,
          left: 0,
          width: 'calc(100vw - 20px)',
        },
        rightPanel: {
          opacity: 1,
          left: 'calc(100vw - 20px)',
          width: inviteLinkContainerWidth,
        },
        chevron: {
          opacity: 1,
          left: 'calc(100vw - 20px - 20px)',
          transform: 'rotate(-45deg)',
        },
        chevronSpan: {
          opacity: 1,
          top: 5,
          left: 4,
          transform: 'rotate(-135deg)',
        },
      },
      mobileView: {
        leftPanel: {
          opacity: 1,
          left: 0,
          width: 'calc(100vw - 20px)',
        },
        rightPanel: {
          opacity: 1,
          left: 'calc(100vw - 20px)',
          width: inviteLinkContainerWidth,
        },
        chevron: {
          opacity: 1,
          left: 'calc(100vw - 20px - 20px)',
          transform: 'rotate(-45deg)',
        },
        chevronSpan: {
          opacity: 1,
          top: 5,
          left: 4,
          transform: 'rotate(-135deg)',
        },
      },
    },
    cannotEdit: {
      leftPanel: {
        opacity: 1,
        left: 0,
        width: 'calc(100vw)',
      },
      rightPanel: {
        opacity: 1,
        left: 'calc(100vw + 20px)',
        width: inviteLinkContainerWidth,
      },
      chevron: {
        opacity: 1,
        left: 'calc(100vw)',
        transform: 'rotate(-45deg)',
      },
      chevronSpan: {
        opacity: 1,
        top: 5,
        left: 4,
        transform: 'rotate(-135deg)',
      },
    },
  };

  let state;
  if (canEditGroup) {
    state = states[minimize ? 'minimize' : 'default'][windowSize.smallerThanOrEqual.isTabletOrMobile ? 'mobileView' : 'desktopView'];
  } else {
    state = states.cannotEdit;
  }

  const addRegisteredUserStates = {
    0: {
      button: {
        opacity: 0,
        width: 0,
        borderColor: 'transparent',
      },
      spinner: {
        opacity: 0,
        width: 0,
      },
      add: {
        opacity: 0,
        width: 0,
      },
      label: {
        height: 21,
        opacity: 1,
        color: '#E20101',
      },
    },
    1: {
      button: {
        opacity: 1,
        width: 60,
        borderColor: '#CDCEDA',
      },
      spinner: {
        opacity: 0,
        width: 0,
      },
      add: {
        opacity: 1,
        width: 60,
      },
      label: {
        height: 42,
        opacity: 1,
        color: '#10A268', // '#355CBC',
      },
    },
    2: {
      button: {
        opacity: 1,
        width: 36,
        borderColor: '#CDCEDA',
      },
      spinner: {
        opacity: 1,
        width: 25,
      },
      add: {
        opacity: 0,
        width: 0,
      },
      label: {
        height: 0,
        opacity: 0,
        color: 'transparent',
      },
    },
    4: {
      button: {
        opacity: 0,
        width: 0,
        borderColor: 'transparent',
      },
      spinner: {
        opacity: 0,
        width: 0,
      },
      add: {
        opacity: 0,
        width: 0,
      },
      label: {
        height: 0,
        opacity: 0,
        color: '#transparent',
      },
    },
  };

  const addRegisteredUserState = addRegisteredUserStates[
    userEmailQuery?.length === 0 ? 4 : userEmailFound
  ];

  const inviteLinkGenerated = generatedInviteLink || generatingInviteLink;

  const spacer = (
    <div
      style={{
        width: 100, height: 6, borderRadius: 3, backgroundColor: '#eeeeee', margin: '0px auto', color: 'transparent',
      }}
    >
      .
    </div>
  );

  const queriedMembers = groupMembers
    ? groupMembers.filter(({ name, email, role }) => {
      // eslint-disable-next-line no-useless-escape
      const r = searchQuery ? new RegExp(`\.\*${escapeRegExp(searchQuery)}\.\*`, 'i') : new RegExp('\.\*', 'i');
      return name.search(r) !== -1 || email.search(r) !== -1 || role.search(r) !== -1;
    })
    : undefined;// .sort();

  const pencilEditButton = (
    <div
      className={styles.pencilEditButton}
      style={{
        transition,
        position: 'absolute',
        opacity: editGroupName ? 0 : 1,
        left: editGroupName ? 20 : 2,
        top: -9,
        cursor: 'pointer',
      }}
    >
      <Pencil
        className={styles.pencil}
        style={{ position: 'absolute', top: 0 }}
        size={18}
        color="#355CBC"
        onClick={() => setEditGroupName(true)}
      />
      <PencilFill
        className={styles.pencilFill}
        style={{ position: 'absolute', top: 0 }}
        size={18}
        color="#355CBC"
        onClick={() => setEditGroupName(true)}
      />
    </div>

  );

  useEffect(() => {
    setUserEmailFound(2);
    if (userEmailQuery?.length > 0) {
      debouncedFunction(() => {
        getUserByEmail(userEmailQuery).then((res) => {
          setUserEmailFound(1);
          setUserData(res);
        }).catch(() => {
          setUserEmailFound(0);
          setUserData();
        });
      });
    } else {
      setUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmailQuery]);

  useEffect(() => {
    if (editGroupName) {
      setNewGroupName(groupName);
    } else {
      setNewGroupName();
      setSaveGroupNameHovered();
      setCancelGroupNameHovered();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editGroupName]);

  useEffect(() => {
    setGroupNameWidth($('#psuedo-group-name').width() + 8);
  }, [groupName]);

  useEffect(() => {
    if (session) {
      setCanEditGroup(['owner', 'manager'].includes(roleInGroup({ session, group })));
    } else if (canEditGroup) {
      // if the session is undefined and canEditGroup is true we need to set it to false because
      // how do we know we can edit if there is no session
      setCanEditGroup();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);


  return (
    <Layout
      alerts={alerts}
      type="group"
      document={group ? { title: groupName } : undefined}
      title={`Manage Group: ${group ? groupName : ''}`}
      statefulSession={statefulSession}
      noContainer
      borderBottom={border}
    >
      {loading ? <LoadingSpinner /> : (
        <>
          <div style={{
            display: 'flex', flexDirection: 'row', position: 'relative', height: '100%', overflow: 'hidden',
          }}
          >
            <div style={{
              position: 'absolute', height: '100%', padding: '0px 50px', transition, ...state.leftPanel,
            }}
            >
              <div style={{
                height: 'calc(100vh - 234px)', maxWidth: 1140, display: 'flex', flexDirection: 'column', margin: '30px auto 0px auto',
              }}
              >
                <div style={{
                  fontSize: 26, fontWeight: 300, marginBottom: 5, display: 'flex', flexDirection: 'row', alignItems: 'center',
                }}
                >
                  <div
                    id="psuedo-group-name"
                    style={{
                      position: 'absolute', visibility: 'hidden', fontSize: 26, fontWeight: 300,
                    }}
                  >
                    {groupName}
                  </div>
                  <div
                    id="psuedo-new-group-name"
                    style={{
                      position: 'absolute', visibility: 'hidden', fontSize: 26, fontWeight: 300,
                    }}
                  >
                    {newGroupName}
                  </div>
                  <input
                    className={[
                      styles.groupNameHeaderInput,
                      editGroupName ? styles.edit : '',
                      saveGroupNameHovered ? styles.saveHovered : '',
                      cancelGroupNameHovered ? styles.cancelHovered : '',
                    ].join(' ')}
                    style={{
                      width: newGroupNameWidth && newGroupNameWidth !== groupNameWidth
                        ? newGroupNameWidth
                        : groupNameWidth,
                    }}
                    type="text"
                    maxLength={100}
                    disabled={!editGroupName}
                    value={newGroupName !== undefined ? newGroupName : groupName}
                    onChange={newGroupName === undefined
                      ? () => {}
                      : (ev) => setNewGroupName(ev.target.value)}
                  />
                  {canEditGroup && group && (
                  <div style={{ width: 0, position: 'relative' }}>
                    {groupName !== newGroupName && newGroupName?.length > 0 && (
                    <Check
                      style={{
                        transition, position: 'absolute', opacity: editGroupName ? 1 : 0, left: -55, top: -11, cursor: 'pointer',
                      }}
                      size={26}
                      color={saveGroupNameHovered ? '#10A268' : '#424242'}
                      onMouseEnter={() => setSaveGroupNameHovered(true)}
                      onMouseLeave={() => setSaveGroupNameHovered()}
                      onClick={() => {
                        renameGroup(group, newGroupName).then(() => {
                          setAlerts((prevState) => [...prevState, {
                            text: 'Group successfully renamed.',
                            variant: 'success',
                          }]);
                        }).catch((err) => {
                          setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                        });
                        setNewGroupNameWidth($('#psuedo-new-group-name').width() + 8);
                        setGroupName(newGroupName);
                        setEditGroupName();
                      }}
                    />
                    )}
                    <X
                      style={{
                        transition, position: 'absolute', opacity: editGroupName ? 1 : 0, left: -30, top: -11, cursor: 'pointer',
                      }}
                      size={26}
                      color={cancelGroupNameHovered ? '#E20101' : '#424242'}
                      onMouseEnter={() => setCancelGroupNameHovered(true)}
                      onMouseLeave={() => setCancelGroupNameHovered()}
                      onClick={() => setEditGroupName()}
                    />
                    {pencilEditButton}
                  </div>
                  )}
                </div>
                <div style={{ display: 'flex' }}>
                  <span
                    className={styles.rolePermissionsText}
                    onClick={() => setShowGroupRolePermissionsModal(true)}
                  >
                    <InfoCircle size={14} style={{ marginRight: 4, position: 'relative', top: 0 }} />
                    <span>Role permissions explained</span>
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{
                    transition,
                    display: 'flex',
                    flexDirection: 'row',
                    flex: 1,
                    height: 38,
                    alignItems: 'center',
                    borderRadius: 8,
                    border: `1px solid ${clearSearchHovered ? '#E20101' : '#bdbdbd'}`,
                    backgroundColor: '#fcfcfc',
                    marginBottom: 20,
                  }}
                  >
                    <Search size={16} color="#424242" style={{ marginLeft: 14, marginRight: 8 }} />
                    <input
                      style={{
                        flex: 1,
                        height: 36,
                        border: 'none',
                        outline: 'none',
                        padding: '0px 8px',
                        backgroundColor: 'transparent',
                        fontStyle: searchQuery.length > 0 ? 'normal' : 'italic',
                      }}
                      placeholder="Search group (members name, email, role)"
                      onChange={(ev) => setSearchQuery(ev.target.value)}
                      value={searchQuery}
                    />
                    <div
                      style={{
                        transition,
                        cursor: 'pointer',
                        height: 36,
                        width: 36,
                        borderRadius: '0px 8px 8px 0px',
                        color: clearSearchHovered ? '#E20101' : '#424242',
                        backgroundColor: clearSearchHovered ? '#FCECEB' : '#eeeeee',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={() => setClearSearchHovered(true)}
                      onMouseLeave={() => setClearSearchHovered()}
                      onClick={() => setSearchQuery('')}
                    >
                      <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                    </div>
                  </div>
                </div>

                {queriedMembers ? (
                  <Table
                    key="group-members-table"
                    id="groups-members-table"
                    height="100vh - 380px"
                    columnHeaders={[
                      { header: 'NAME', flex: 8 },
                      { header: 'EMAIL', flex: 7 },
                      { header: 'ROLE', flex: 5 },
                    ]}
                    rows={queriedMembers.map(({
                      id, name, email, role,
                    }) => ({
                      key: `queried-members-${id}`,
                      deleteHovered: id === rowDeleteHovered,
                      columns: [
                        { content: name, style: { fontWeight: 400 } },
                        { content: email, style: { color: '#86919D' } },
                        {
                          content: role === 'owner' ? 'Owner' : (
                            <TextDropdown
                              style={{
                                position: 'absolute', top: 14, zIndex: 100, color: '#86919D',
                              }}
                              options={[
                                { text: 'Manager', key: 'manager' },
                                { text: 'Member', key: 'member' },
                              ]}
                              disabled={!canEditGroup}
                              selectedKey={role}
                              setSelectedKey={canEditGroup
                                ? (newRoleKey) => {
                                  changeUserRole(
                                    group,
                                    {
                                      id, name, email, role,
                                    },
                                    newRoleKey,
                                  ).then(() => {
                                    setGroupMembers(groupMembers.map((m) => ({
                                      ...m,
                                      role: m.id === id ? newRoleKey : m.role,
                                    })));
                                    setAlerts((prevState) => [...prevState, {
                                      text: 'User\'s role changed successfully.',
                                      variant: 'success',
                                    }]);
                                  }).catch((err) => {
                                    setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                  });
                                }
                                : () => {}}
                            />
                          ),
                          style: { color: '#86919D' },
                        },
                      ],
                      hoverContent: canEditGroup && session?.user
                        && id !== session.user.id && role !== 'owner' && (
                        // eslint-disable-next-line jsx-a11y/interactive-supports-focus
                        <div
                          style={{
                            position: 'absolute',
                            top: 15,
                            right: 20,
                            height: 32,
                            width: 32,
                            borderRadius: 4,
                            backgroundColor: '#FCECEB',
                            color: '#E20101',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          role="button"
                          onClick={() => deleteMember({ id, name })}
                          onMouseEnter={() => setRowDeleteHovered(id)}
                          onMouseLeave={() => setRowDeleteHovered()}
                        >
                          <Trash size={20} />
                        </div>
                      ),
                      moreOptions: [
                        { text: 'Manage', onClick: () => {} },
                        { text: 'Delete', onClick: () => {} },
                        { text: 'Archive', onClick: () => {} },
                      ],
                    }))}
                  />
                ) : <Spinner />}

              </div>
            </div>
            <div
              style={{
                transition,
                position: 'absolute',
                left: windowSize.isMobilePhone && !minimize ? 0 : -20,
                opacity: windowSize.isMobilePhone && !minimize ? 1 : 0,
                backgroundColor: 'white',
                width: 20,
                height: '100%',
              }}
            />
            <div
              className={styles.chevronContainer}
              style={{
                transition,
                borderLeft: border,
                borderTop: border,
                zIndex: 11,
                ...state.chevron,
              }}
              onClick={() => setMinimize(!minimize)}
            >
              <span style={{
                position: 'absolute', ...state.chevronSpan,
              }}
              >
                <ChevronCompactRight size={20} />
              </span>
            </div>
            <div
              className={styles.metadataContainer}
              style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                height: '100%',
                backgroundColor: '#F9F9F9',
                borderLeft: border,
                padding: '20px 24px',
                overflowY: 'overlay',
                transition,
                ...state.rightPanel,
              }}
            >
              {canEditGroup && (
                <>
                  <div style={{
                    fontSize: 22, fontWeight: 'bold', color: '#424242', marginBottom: 20,
                  }}
                  >
                    Invite Link
                  </div>
                  <div
                    style={{
                      transition,
                      fontSize: 14,
                      color: inviteLinkGenerated ? 'transparent' : '#424242',
                      fontWeight: 500,
                      height: inviteLinkGenerated ? 0 : 29,
                      minHeight: inviteLinkGenerated ? 0 : 29,
                      overflow: 'hidden',
                      opacity: inviteLinkGenerated ? 0 : 1,
                    }}
                  >
                    Generate an invite link to send to registered or new users
                  </div>
                  <div style={{
                    transition,
                    fontSize: 14,
                    color: inviteLinkGenerated ? '#424242' : 'transparent',
                    fontWeight: 500,
                    height: inviteLinkGenerated ? 50 : 0,
                    minHeight: inviteLinkGenerated ? 50 : 0,
                    overflow: 'hidden',
                    opacity: inviteLinkGenerated ? 1 : 0,
                  }}
                  >
                    Send this invite link to registered or new users to add them to the group
                  </div>
                  <div style={{ marginBottom: 8, display: 'flex', flexDirection: 'row' }}>
                    <div style={{
                      transition,
                      height: 36,
                      width: inviteLinkGenerated ? 'calc(100% - 95px)' : 0,
                      backgroundColor: deletingInviteLink ? '#FCECEB' : '#F2F2F2',
                      border: `1px solid ${inviteLinkGenerated ? `${deletingInviteLink ? '#E20101' : '#CDCEDA'}` : 'transparent'}`,
                      marginRight: inviteLinkGenerated ? 4 : 0,
                      color: deletingInviteLink ? '#E20101' : '#757575',
                      borderRadius: 4,
                      lineHeight: '32px',
                      padding: inviteLinkGenerated ? '0px 10px' : 0,
                      opacity: inviteLinkGenerated ? 1 : 0,
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                    >
                      {generatedInviteLink}
                    </div>
                    <div
                      className={`${styles.actionBtn} ${deletingInviteLink && styles.red}`}
                      style={{
                        transition,
                        height: 36,
                        width: inviteLinkGenerated ? 65 : 160,
                        borderRadius: 4,
                        display: 'flex',
                        alignItmes: 'center',
                        justifyContent: 'center',
                        border: '1px solid #CDCEDA',
                        cursor: 'pointer',
                        color: deletingInviteLink ? '#E20101' : '#424242',
                      }}
                      onClick={() => {
                        if (generatingInviteLink || deletingInviteLink) { return; }
                        if (generatedInviteLink) {
                          // eslint-disable-next-line no-undef
                          copyToClipboard(window.document, generatedInviteLink);
                          setAlerts((prevState) => [...prevState, { text: 'Link copied to clipboard', variant: 'success' }]);
                        } else {
                          setGeneratingInviteLink(true);
                          generateInviteToken(group).then((data) => {
                            const inviteUrl = `${baseUrl}/auth/signin?callbackUrl=${baseUrl}&groupToken=${data.value.inviteToken}`;
                            setGeneratedInviteLink(inviteUrl);
                            setGeneratingInviteLink();
                            setAlerts((prevState) => [...prevState, {
                              text: 'Group invite token created successfully.',
                              variant: 'success',
                            }]);
                          }).catch((err) => {
                            setGeneratingInviteLink();
                            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                          });
                        }
                      }}
                    >
                      <span
                        style={{
                          transition,
                          lineHeight: '32px',
                          width: inviteLinkGenerated ? 0 : 160,
                          overflow: 'hidden',
                          opacity: inviteLinkGenerated ? 0 : 1,
                          textAlign: 'center',
                        }}
                      >
                        Generate Link
                      </span>
                      <span
                        style={{
                          transition,
                          lineHeight: '32px',
                          width: inviteLinkGenerated ? 65 : 0,
                          overflow: 'hidden',
                          opacity: inviteLinkGenerated ? 1 : 0,
                          textAlign: 'center',
                        }}
                      >
                        {generatingInviteLink ? (
                          <Spinner
                            style={{
                              color: '#CDCEDA', width: 25, height: 25, position: 'relative', top: 4,
                            }}
                            animation="border"
                            role="status"
                            data-testid="loading-spinner"
                          />
                        ) : 'Copy'}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      transition,
                      fontWeight: 400,
                      fontSize: 14,
                      height: inviteLinkGenerated ? 65 : 0,
                      opacity: inviteLinkGenerated ? 0.8 : 0,
                      marginBottom: 40,
                    }}
                  >
                    <span>
                      If you need a new link or the current one is not working
                      <br />
                    </span>
                    <a
                      href="#"
                      className={styles.hoverableText}
                      onClick={() => {
                        setDeletingInviteLink(true);
                        deleteInviteToken(group).then(() => {
                          setGeneratedInviteLink();
                          setAlerts((prevState) => [...prevState, {
                            text: 'Group invite token deleted successfully.',
                            variant: 'warning',
                          }]);
                          setDeletingInviteLink();
                        }).catch((err) => {
                          setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                          setDeletingInviteLink();
                        });
                      }}
                    >
                      click here to remove the current link
                    </a>
                    <span>, then generate a new one. The old link will no longer work</span>
                  </div>
                  {spacer}
                  <div style={{
                    fontSize: 22, fontWeight: 'bold', color: '#424242', marginBottom: 20, marginTop: 35,
                  }}
                  >
                    Add Registered User
                  </div>
                  <div
                    style={{
                      transition,
                      fontSize: 14,
                      color: '#424242',
                      fontWeight: 500,
                      marginBottom: 10,
                    }}
                  >
                    Automatically add a registered user to this group by searching for their email
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 4 }}>
                    <input
                      placeholder="User's email"
                      style={{
                        border: '1px solid #CDCEDA',
                        flex: 1,
                        borderRadius: 4,
                        height: 36,
                        fontStyle: userEmailQuery?.length > 0 ? 'normal' : 'italic',
                      }}
                      value={userEmailQuery}
                      onChange={(ev) => setUserEmailQuery(ev.target.value)}
                    />
                    <div
                      className={styles.addRegisteredUserBtn}
                      style={{
                        transition,
                        ...addRegisteredUserState.button,
                      }}
                    >
                      <div
                        style={{
                          transition,
                          ...addRegisteredUserState.spinner,
                        }}
                        onClick={userData ? () => {
                          addUserToGroup(group, userData.email).then((data) => {
                            const { _id, name, email = userData.email } = data.slice(-1)[0].value;
                            const member = {
                              name, email, id: _id, role: 'member',
                            };
                            setGroupMembers((prevState) => [...prevState, member]);
                            setUserData();
                            setUserEmailQuery('');
                            setUserEmailFound(2);
                            setAlerts((prevState) => [...prevState, {
                              text: 'User successfully added to group.',
                              variant: 'success',
                            }]);
                          }).catch((err) => {
                            setUserData();
                            setUserEmailQuery('');
                            setUserEmailFound(2);
                            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                          });
                        } : () => {}}
                      >
                        <Spinner
                          style={{
                            color: '#CDCEDA', width: 25, height: 25, position: 'relative', top: 5.5, left: 5.5,
                          }}
                          animation="border"
                          role="status"
                          data-testid="loading-spinner"
                        />
                      </div>
                      <div
                        style={{
                          transition,
                          textAlign: 'center',
                          lineHeight: '34px',
                          color: '#424242',
                          ...addRegisteredUserState.add,
                        }}
                      >
                        Add
                      </div>
                    </div>
                  </div>
                  <div style={{
                    transition, marginBottom: 40, fontSize: 14, fontWeight: 'bold', paddingLeft: 2, ...addRegisteredUserState.label,
                  }}
                  >
                    <div>{`${userEmailFound === 0 ? 'User email not found' : 'User email found'}`}</div>
                    <div style={{
                      transition, color: '#757575', fontWeight: 300, opacity: userData ? 1 : 0,
                    }}
                    >
                      {`${userData?.name} / ${userData?.email}`}
                    </div>
                  </div>
                  {spacer}
                  <div style={{ flex: 1, marginBottom: 40 }} />
                  <div
                    className={styles.deleteGroupBtn}
                    onClick={() => setShowDeleteGroupModal(true)}
                  >
                    Delete Group
                  </div>
                </>
              )}
            </div>
          </div>
          <Modal
            id="delete-group-modal"
            size="lg"
            show={showDeleteGroupModal}
            onHide={() => setShowDeleteGroupModal()}
          >
            <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{
                  flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
                }}
                >
                  Delete Group
                </div>
                <div className={styles.cancelUploadBtn} onClick={() => setShowDeleteGroupModal()}>
                  <X size={20} />
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'row', marginTop: 50, marginBottom: 70,
              }}
              >
                <Button
                  variant="danger"
                  onClick={() => {
                    deleteGroup(group).then(() => {
                      Router.push({
                        pathname: '/groups',
                        query: {
                          alert: 'deletedGroup',
                          deletedGroupId: group.id,
                        },
                      }, '/groups');
                    }).catch((err) => {
                      setShowDeleteGroupModal();
                      setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                    });
                  }}
                >
                  Delete Group

                </Button>
              </div>
            </Modal.Body>
          </Modal>
          <RolePermissionsModal
            show={showGroupRolePermissionsModal}
            setShow={setShowGroupRolePermissionsModal}
          />
        </>
      )}
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
