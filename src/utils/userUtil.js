/* eslint-disable import/no-cycle */
import unfetch from 'unfetch';
import { removeUserFromGroup, deleteGroupById } from './groupUtil';
import { appendProtocolIfMissing } from './fetchUtil';

const getUserByEmail = async (email) => {
  const url = `/api/user/email/${email}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get user: error ${res.status} received from server`));
};

const getUserById = async (id) => {
  const url = `/api/user/${id}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get user: error ${res.status} received from server`));
};

const getUsersByIds = async (userIds) => {
  const url = `/api/users`;
  const body = { userIds };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to get user: error ${res.status} received from server`));
};

const prefetchUserById = async (id, cookie) => {
  const url = `${appendProtocolIfMissing(process.env.SITE)}/api/user/${id}`;
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
  } return Promise.reject(Error(`Unable to get user: error ${res.status} received from server`));
};

const deleteUserById = async (id) => getUserById(id).then(async (user) => {
  await Promise.all(user.groups.map(async (group) => {
    await removeUserFromGroup(group, { ...user, id })
      .then(async () => {
        if (group.role === 'owner') {
          await deleteGroupById(group.id);
        }
      })
      .catch((err) => Promise.reject(err));
  }))
    .then(async () => {
      const url = `/api/user/${id}`;
      const res = await unfetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 200) {
        return Promise.resolve(res.json());
      } return Promise.reject(Error(`Unable to delete user: error ${res.status} received from server`));
    })
    .catch((err) => Promise.reject(err));
}).catch((err) => Promise.reject(err));

const changeUserRole = async (id, role) => {
  const url = `/api/user/${id}`;
  const body = { newRole: role };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    return Promise.resolve(res.json());
  } return Promise.reject(Error(`Unable to modify user: error ${res.status} received from server`));
};

export {
  changeUserRole,
  deleteUserById,
  getUserByEmail,
  getUserById,
  getUsersByIds,
  prefetchUserById,
};
