/* eslint-disable import/no-cycle */
/* eslint-disable no-underscore-dangle */
import unfetch from 'unfetch';
import { getAllDocumentsByGroup } from './docUtil';
import { getUserByEmail } from './userUtil';

const updateMemberCounts = async (group) => {
  const { members } = group;
  // eslint-disable-next-line no-underscore-dangle
  const updatedGroupId = group._id;
  const memberCount = members.length;
  return Promise.all(
    members.map(async (member) => {
      const url = `/api/user/${member.id}`;
      const body = {
        updatedGroupId,
        memberCount,
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
  alreadyInGroup = user.groups && user.groups.some((userGroup) => (userGroup.id === group.id));
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
      const response = await res.json();
      const memberCount = response.value.members.length;
      const ownerName = response.value.members.filter((member) => member.role === 'owner')[0].name;
      const groupToAdd = {
        id: group.id,
        name: response.value.name,
        memberCount,
        ownerName,
        role: 'member',
      };
      return addGroupToUser(groupToAdd, user, false)
        .then(() => updateMemberCounts(response.value))
        .catch((err) => Promise.reject(err));
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
    return removeGroupFromUser(group, user).then(updateMemberCounts(response.value));
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
    const response = await res.json();
    if (!response.ops[0].token) {
      return Promise.reject(Error(`Unable to add token to group: ${JSON.stringify(response)}`));
    }
    const groupUrl = `/api/group/${id}`;
    const groupBody = { inviteToken: response.ops[0].token };
    const groupRes = await unfetch(groupUrl, {
      method: 'PATCH',
      body: JSON.stringify(groupBody),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (groupRes.status === 200) {
      const groupResponse = await groupRes.json();
      return Promise.resolve(groupResponse);
    } return Promise.reject(Error(`Unable to add token to group: error ${res.status} received from server`));
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

const getGroupNameById = async (id) => {
  const url = `/api/group/${id}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { name } = response;
    return Promise.resolve(name);
  } if (res.status === 404) {
    return Promise.resolve('[group not found]');
  } return Promise.reject(Error(`Unable to find group with id ${id}: error ${res.status} received from server`));
};

const prefetchGroupById = async (id, cookie) => {
  const url = `${process.env.SITE}/api/group/${id}`;
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

export {
  addGroupToUser,
  addUserToGroup,
  changeUserRole,
  deleteGroup,
  deleteGroupById,
  deleteInviteToken,
  generateInviteToken,
  getGroupById,
  getGroupNameById,
  prefetchGroupById,
  removeUserFromGroup,
  renameGroup,
};
