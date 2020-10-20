import unfetch from 'unfetch';

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

const prefetchUserById = async (id, cookie) => {
  const url = `${process.env.SITE}/api/user/${id}`;
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

export { getUserByEmail, getUserById, prefetchUserById };
