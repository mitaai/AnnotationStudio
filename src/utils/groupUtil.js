import fetch from 'unfetch';
import Router from 'next/router';
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
      if (res.status !== 200) { return Promise.reject(Error(`Unable to update member counts: error ${res.status} received from server`)); }
      return Promise.resolve(res.json());
    }),
  );
};

const AddGroupToUser = async (group, user, isNewGroup) => {
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
    const result = await res.json();
    let query = {};
    if (isNewGroup) query = { alert: 'newGroup' };
    Router.push({
      pathname: `/groups/${group.id}/edit`,
      query,
    });
    return Promise.resolve(result);
  }
  return Promise.reject(Error(`Unable to add group to user: error ${res.status} received from server`));
};

const AddUserToGroup = async (group, email) => {
  const user = await GetUserByEmail(email);
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
      const result = await res.json();
      const memberCount = result.value.members.length;
      const ownerName = result.value.members.filter((member) => member.role === 'owner')[0].name;
      const groupToAdd = {
        id: group.id,
        name: result.value.name,
        memberCount,
        ownerName,
        role: 'member',
      };
      return AddGroupToUser(groupToAdd, user).then(UpdateMemberCounts(result.value));
    } return Promise.reject(Error(`Unable to add user to group: error ${res.status} received from server`));
  } return Promise.reject(Error(`Unable to add user with email ${email}: error ${user.error}.`));
};

const RemoveGroupFromUser = async (group, user, groupDeletion) => {
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
    if (!groupDeletion) {
      Router.push({
        pathname: `/groups/${group.id}/edit`,
      });
    }
    return Promise.resolve(res.json());
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
    const result = await res.json();
    return RemoveGroupFromUser(group, user).then(UpdateMemberCounts(result.value));
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
    Router.push({
      pathname: '/groups',
      query: {
        alert: 'deletedGroup',
      },
    }, '/groups');
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
    const result = await res.json();
    const group = { id, name: result.name, members: result.members };
    return DeleteGroup(group);
  } return Promise.reject(Error(`Unable to find group by ID: error ${res.status} received from server`));
};

const ChangeUserRole = async (group, member, role) => {
  // 1. Change user's role in group
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
    console.log(res);
  }
  // 2. Update user's role in user's group object
};

export {
  AddGroupToUser,
  AddUserToGroup,
  ChangeUserRole,
  DeleteGroup,
  DeleteGroupFromId,
  RemoveUserFromGroup,
};
