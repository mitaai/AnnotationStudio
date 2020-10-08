import fetch from 'unfetch';

const getUserByEmail = async (email) => {
  const url = `/api/user/email/${email}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return Promise.resolve(res.json());
};

// eslint-disable-next-line import/prefer-default-export
export { getUserByEmail };
