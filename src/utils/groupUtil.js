import fetch from 'unfetch';
import Router from 'next/router';
import { GetUserByEmail } from './userUtil';

const AddGroupToUser = async (group, user) => {
  const url = `/api/user/${user.id}`;
  const { role } = user;
  const {
    id,
    name,
    ownerName,
    memberCount,
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
    if (role === 'owner') {
      Router.push({
        pathname: `/groups/${group.id}`,
      });
    } else {
      Router.push({
        pathname: `/groups/${group.id}/edit`,
      });
    }
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
        name: result.name,
        memberCount,
        ownerName,
      };
      return AddGroupToUser(groupToAdd, user);
    } return Promise.reject(Error(`Unable to add user to group: error ${res.status} received from server`));
  } return Promise.reject(Error(`Could not add user with email ${email}: error ${user.error}.`));
};

export { AddGroupToUser, AddUserToGroup };
