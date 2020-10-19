import unfetch from 'unfetch';

const adminGetList = async (type, params) => {
  const url = `/api/admin/${type}${params}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const data = res.json();
    return Promise.resolve(data);
  } return Promise.reject(Error(`Unable to get ${type}, ${res.status} received from server`));
};

// eslint-disable-next-line import/prefer-default-export
export { adminGetList };
