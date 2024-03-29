/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import unfetch from 'unfetch';
import { getAllDocumentsByGroup } from './docUtil';
import { getUserByEmail } from './userUtil';
import { appendProtocolIfMissing } from './fetchUtil';

const updateMemberCounts = async ({ members, groupId }) => {
  return Promise.all(
    members.map(async (member) => {
      const url = `/api/user/${member.id}`;
      const body = {
        updatedGroupId: groupId,
        memberCount: members.length,
      };
      const res = await unfetch(url, {
        method: 'PATCH',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 200) {
        const response = await res.json();
        return Promise.resolve(response);
      } return Promise.reject(Error(`Unable to update member counts: error ${res.status} received from server`));
    }),
  );
};

const addGroupToUser = async (group, user) => {
  const url = `/api/user/${user.id}`;
  const {
    id,
    name,
    ownerName,
    memberCount,
    role,
  } = group;
  const body = {
    addedGroup: {
      id,
      name,
      ownerName,
      memberCount,
      role,
    },
  };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  }
  return Promise.reject(Error(`Unable to add group to user: error ${res.status} received from server`));
};

const addUserToGroup = async (
  group, email, inviteToken,
) => getUserByEmail(email).then(async (user) => {
  let alreadyInGroup = false;
  alreadyInGroup = Array.isArray(user.groups) && user.groups.some((userGroup) => (userGroup.id === group.id));
  const error = (alreadyInGroup === true) ? 'User is already in group' : undefined;
  if (!error) {
    const url = `/api/group/${group.id}`;
    const {
      id, name,
    } = user;
    const role = 'member';
    const body = {
      addedUser: {
        id, name, email, role,
      },
      inviteToken,
    };
    const res = await unfetch(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.status === 200) {
      const { value: originalGroup } = await res.json();
      const memberCount = originalGroup.members.length + 1;
      const ownerName = originalGroup.members.filter((member) => member.role === 'owner')[0].name;
      const groupToAdd = {
        id: group.id,
        name: originalGroup.name,
        memberCount,
        ownerName,
        role: 'member',
      };

      const members = originalGroup.members.concat({ id: user.id, name: user.name, email: user.email, role: 'member'})
      
      return addGroupToUser(groupToAdd, user, false)
        .then(async () => {
          await updateMemberCounts({ members, groupId: originalGroup._id });
          return { user, group: { ...originalGroup, members } };
        }).catch((err) => Promise.reject(err));
    } return Promise.reject(Error(`Unable to add user to group: error ${res.status} received from server`));
  } return Promise.reject(Error(`Unable to add user with email ${email}: ${error}.`));
}).catch((err) => Promise.reject(err));

const removeGroupFromUser = async (group, user) => {
  const removedGroupId = group.id;
  const url = `/api/user/${user.id}`;
  const body = { removedGroupId };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to remove group from user: error ${res.status} received from server`));
};

const removeUserFromGroup = async (group, user) => {
  const removedUserId = user.id;
  const url = `/api/group/${group.id}`;
  const body = { removedUserId };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const members = response.value.members.filter(({ id }) => id !== user.id)
    const groupId = response.value._id;
    return removeGroupFromUser(group, user).then(updateMemberCounts({ members, groupId }));
  } return Promise.reject(Error(`Unable to remove user from group: error ${res.status} received from server`));
};

const removeGroupFromDocuments = async (group) => {
  const documents = await getAllDocumentsByGroup([group]);
  return (Array.isArray(documents) && documents.length > 0)
    ? Promise.all(
      documents.map(async (document) => {
        const url = `/api/document/${document._id}`;
        const body = {
          removedGroupId: group.id,
        };
        const res = await unfetch(url, {
          method: 'PATCH',
          body: JSON.stringify(body),
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (res.status === 200) {
          const result = await res.json();
          return Promise.resolve(result);
        } return Promise.reject(Error(`Unable to remove group from documents: error ${res.status} receievd from server`));
      }),
    )
    : Promise.resolve([]);
};

const deleteGroup = async (group) => {
  const { members } = group;
  const url = `/api/group/${group.id}`;
  const res = await unfetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return removeGroupFromDocuments(group)
      .then(Promise.all(
        members.map(async (member) => removeGroupFromUser(group, member, true)),
      ))
      .catch((err) => Promise.reject(Error(err.message)));
  } return Promise.reject(Error(`Unable to delete group: error ${res.status} received from server`));
};

const deleteGroupById = async (id) => {
  const url = `/api/group/${id}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const group = { id, name: response.name, members: response.members };
    return deleteGroup(group);
  } return Promise.reject(Error(`Unable to find group by ID: error ${res.status} received from server`));
};

const changeUserRole = async (group, member, role) => {
  const url = `/api/group/${group.id}`;
  const body = { memberToChangeRoleId: member.id, role };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const memberUrl = `/api/user/${member.id}`;
    const memberBody = { updatedGroupId: group.id, role };
    const memberRes = await unfetch(memberUrl, {
      method: 'PATCH',
      body: JSON.stringify(memberBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (memberRes.status === 200) {
      const response = memberRes.json();
      return Promise.resolve(response);
    } return Promise.reject(Error(`Unable to update user: error ${memberRes.status} received from server`));
  } return Promise.reject(Error(`Unable to change user's role: error ${res.status} received from server`));
};

const renameGroupInMember = async (group, member, newName) => {
  const url = `/api/user/${member.id}`;
  const body = { updatedGroupId: group.id, groupName: newName };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to update user: error ${res.status} received from server`));
};

const renameGroup = async (group, newName) => {
  const { members } = group;
  const url = `/api/group/${group.id}`;
  const body = { name: newName };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.all(
      members.map(async (member) => renameGroupInMember(group, member, newName)),
    );
  } return Promise.reject(Error(`Unable to update user: error ${res.status} received from server`));
};

const getInviteTokenById = async (id) => {
  const url = `/api/invite/id/${id}`;
  const res = await unfetch(url, {
    method: 'GET',
  });
  if (res.status === 200) {
    const token = await res.json();
    return Promise.resolve(token);
  } return Promise.reject(Error(`Unable to get invite token: error ${res.status} received from server`));
};

const generateInviteToken = async (group) => {
  const { id } = group;
  const url = '/api/invite';
  const body = { group: id };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const { insertedId } = await res.json();
    const tokenResult = await getInviteTokenById(insertedId)
    if (tokenResult.token) {
      const groupUrl = `/api/group/${id}`;
      const groupBody = { inviteToken: tokenResult.token };
      const groupRes = await unfetch(groupUrl, {
        method: 'PATCH',
        body: JSON.stringify(groupBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (groupRes.status === 200) {
        return Promise.resolve(groupBody);
      } return Promise.reject(Error(`Unable to add token to group: error ${res.status} received from server`));
    } return Promise.reject(tokenResult)
    
    
  } return Promise.reject(Error(`Unable to generate token: error ${res.status} received from server`));
};

const deleteInviteToken = async (group) => {
  const { inviteToken } = group;
  const url = `/api/invite/${inviteToken}`;
  const res = await unfetch(url, {
    method: 'DELETE',
  });
  if (res.status === 200) {
    const groupUrl = `/api/group/${group.id}`;
    const body = { tokenToRemove: inviteToken };
    const groupRes = await unfetch(groupUrl, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (groupRes.status === 200) {
      const groupResponse = groupRes.json();
      return Promise.resolve(groupResponse);
    } return Promise.reject(Error(`Unable to remove token from group: error ${groupRes.status} received from server`));
  } return Promise.reject(Error(`Unable to delete token: error ${res.status} received from server`));
};

const prefetchGroupById = async (id, cookie) => {
  const url = `${appendProtocolIfMissing(process.env.SITE)}/api/group/${id}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get group ${id}: error ${res.status} received from server`));
};

const getGroupById = async (id) => {
  const url = `/api/group/${id}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get group ${id}: error ${res.status} received from server`));
};

const archiveGroupById = async (id) => {
  const url = `/api/group/archive/${id}`;
  const res = await unfetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get group ${id}: error ${res.status} received from server`));
};

const unarchiveGroupById = async (id) => {
  const url = `/api/group/unarchive/${id}`;
  const res = await unfetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get group ${id}: error ${res.status} received from server`));
};

const getGroupsByGroupIds = async (groupIds) => {
  const url = '/api/groupsByIds';
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify({ groupIds }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get groups by group ids: error ${res.status} received from server`));
};

const roleInGroup = ({ session, group }) => {
  const groupInSession = session.user.groups
    .find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === group.id));
  const memberInGroup = group.members
    .find((o) => Object.entries(o).some(([k, value]) => k === 'id' && value === session.user.id));
  if (groupInSession || memberInGroup) {
    return groupInSession ? groupInSession.role : memberInGroup.role;
  }
  // if the user session is an admin we will give them all the privledges an owner of the group
  // would have
  return session.user.role === 'admin' ? 'owner' : 'unauthorized';
};

export {
  addGroupToUser,
  addUserToGroup,
  changeUserRole,
  deleteGroup,
  deleteGroupById,
  deleteInviteToken,
  getInviteTokenById,
  generateInviteToken,
  getGroupById,
  prefetchGroupById,
  removeUserFromGroup,
  renameGroup,
  getGroupsByGroupIds,
  roleInGroup,
  archiveGroupById,
  unarchiveGroupById,
};
