import unfetch from 'unfetch';

const createOutline = async ({ name, document }) => {
  const postUrl = '/api/outline';
  const res = await unfetch(postUrl, {
    method: 'POST',
    body: JSON.stringify({
      name,
      document,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result.ops[0]);
  }
  return Promise.reject(Error(`Unable to create idea space: error ${res.status} received from server`));
};

const getAllOutlines = async () => {
  const url = '/api/outline';
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result);
  }
  return Promise.reject(Error(`Unable to create idea space: error ${res.status} received from server`));
};

const updateOutlineData = async ({ id, name, document }) => {
  const url = `/api/outline/${id}`;
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify({
      name,
      document,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result);
  }
  return Promise.reject(Error(`Unable to create idea space: error ${res.status} received from server`));
};

const deleteOutline = async (id) => {
  const url = `/api/outline/${id}`;
  const res = await unfetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result);
  }
  return Promise.reject(Error(`Unable to create idea space: error ${res.status} received from server`));
};

export {
  createOutline,
  getAllOutlines,
  updateOutlineData,
  deleteOutline,
};
