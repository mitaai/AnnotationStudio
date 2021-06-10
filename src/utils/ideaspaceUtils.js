import unfetch from 'unfetch';

const createIdeaSpace = async ({ name, annotationIds = {} }) => {
  const postUrl = '/api/ideaspace';
  const res = await unfetch(postUrl, {
    method: 'POST',
    body: JSON.stringify({
      name,
      annotationIds,
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

const getAllIdeaSpaces = async () => {
  const url = '/api/ideaspace';
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

const deleteIdeaSpace = async (id) => {
  const url = `/api/ideaspace/${id}`;
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
  createIdeaSpace,
  getAllIdeaSpaces,
  deleteIdeaSpace,
};
