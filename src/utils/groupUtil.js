import fetch from 'unfetch';
import { GetUserByEmail } from './userUtil';

const UpdateMemberCounts = async (group) => {
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
      const res = await fetch(url, {
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

const AddGroupToUser = async (group, user) => {
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
  const res = await fetch(url, {
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

const AddUserToGroup = async (group, email) => {
  const user = await GetUserByEmail(email);
  let alreadyInGroup = false;
  alreadyInGroup = user.groups.some((userGroup) => (userGroup.id === group.id));
  user.error = (alreadyInGroup === true) ? 'User is already in group' : undefined;
  if (!user.error) {
    const url = `/api/group/${group.id}`;
    const {
      id, name,
    } = user;
    const role = 'member';
    const body = {
      addedUser: {
        id, name, email, role,
      },
    };
    const res = await fetch(url, {
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
      return AddGroupToUser(groupToAdd, user, false)
        .then(UpdateMemberCounts(response.value));
    } return Promise.reject(Error(`Unable to add user to group: error ${res.status} received from server`));
  } return Promise.reject(Error(`Unable to add user with email ${email}: ${user.error}.`));
};

const RemoveGroupFromUser = async (group, user) => {
  const removedGroupId = group.id;
  const url = `/api/user/${user.id}`;
  const body = { removedGroupId };
  const res = await fetch(url, {
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

const RemoveUserFromGroup = async (group, user) => {
  const removedUserId = user.id;
  const url = `/api/group/${group.id}`;
  const body = { removedUserId };
  const res = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return RemoveGroupFromUser(group, user).then(UpdateMemberCounts(response.value));
  } return Promise.reject(Error(`Unable to remove user from group: error ${res.status} received from server`));
};

const DeleteGroup = async (group) => {
  const { members } = group;
  const url = `/api/group/${group.id}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.all(
      members.map(async (member) => RemoveGroupFromUser(group, member, true)),
    );
  } return Promise.reject(Error(`Unable to delete group: error ${res.status} received from server`));
};

const DeleteGroupFromId = async (id) => {
  const url = `/api/group/${id}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const group = { id, name: response.name, members: response.members };
    return DeleteGroup(group);
  } return Promise.reject(Error(`Unable to find group by ID: error ${res.status} received from server`));
};

const ChangeUserRole = async (group, member, role) => {
  const url = `/api/group/${group.id}`;
  const body = { memberToChangeRoleId: member.id, role };
  const res = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const memberUrl = `/api/user/${member.id}`;
    const memberBody = { updatedGroupId: group.id, role };
    const memberRes = await fetch(memberUrl, {
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

const RenameGroupInMember = async (group, member, newName) => {
  const url = `/api/user/${member.id}`;
  const body = { updatedGroupId: group.id, groupName: newName };
  const res = await fetch(url, {
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

const RenameGroup = async (group, newName) => {
  const { members } = group;
  const url = `/api/group/${group.id}`;
  const body = { name: newName };
  const res = await fetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.all(
      members.map(async (member) => RenameGroupInMember(group, member, newName)),
    );
  } return Promise.reject(Error(`Unable to update user: error ${res.status} received from server`));
};

const GenerateInviteToken = async (group) => {
  const { id } = group;
  const url = '/api/invite';
  const body = { group: id };
  const res = await fetch(url, {
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
    const groupRes = await fetch(groupUrl, {
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

const DeleteInviteToken = async (group) => {
  const { inviteToken } = group;
  const url = `/api/invite/${inviteToken}`;
  const res = await fetch(url, {
    method: 'DELETE',
  });
  if (res.status === 200) {
    const groupUrl = `/api/group/${group.id}`;
    const body = { tokenToRemove: inviteToken };
    const groupRes = await fetch(groupUrl, {
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

export {
  AddGroupToUser,
  AddUserToGroup,
  ChangeUserRole,
  DeleteGroup,
  DeleteGroupFromId,
  DeleteInviteToken,
  GenerateInviteToken,
  RemoveUserFromGroup,
  RenameGroup,
};
