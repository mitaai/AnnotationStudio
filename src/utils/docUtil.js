import myFetch from 'unfetch';

const getDocumentsByUser = async (id, limit) => {
  const url = '/api/documents';
  const body = { userId: id, limit };
  const res = await myFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { documents } = response;
    return Promise.resolve(documents);
  } return Promise.reject(Error(`Unable to retrieve documents: error ${res.status} received from server`));
};

const getDocumentBySlug = async (slug, cookie) => {
  const url = `${process.env.SITE}/api/document/slug/${slug}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to retrieve document: error ${res.status} received from server`));
};

const getAllDocumentsByGroup = async (groups) => {
  const url = '/api/documents';
  const body = { groupIds: groups.map((group) => group.id) };
  const res = await myFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { documents } = response;
    return Promise.resolve(documents);
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to retrieve documents: error ${res.status} received from server`));
};

const getSharedDocumentsByGroup = async (groups, limit) => {
  const url = '/api/documents';
  const body = { groupIds: groups.map((group) => group.id), limit };
  const res = await myFetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { documents } = response;
    return Promise.resolve(documents.filter((document) => document.state !== 'draft'));
  } return Promise.reject(Error(`Unable to retrieve documents: error ${res.status} received from server`));
};

const deleteDocumentById = async (id) => {
  const url = `/api/document/${id}`;
  const res = await myFetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result);
  } return Promise.reject(Error(`Unable to delete document: error ${res.status} received from server`));
};

export {
  deleteDocumentById,
  getDocumentsByUser,
  getAllDocumentsByGroup,
  getSharedDocumentsByGroup,
  getDocumentBySlug,
};
