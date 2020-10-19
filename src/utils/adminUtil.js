import unfetch from 'unfetch';

const adminGetGroups = async (params) => {
  const url = `/api/admin/groups${params}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const groups = res.json();
    return Promise.resolve(groups);
  } return Promise.reject(Error(`Unable to get groups, ${res.status} received from server`));
};

// eslint-disable-next-line import/prefer-default-export
export { adminGetGroups };
