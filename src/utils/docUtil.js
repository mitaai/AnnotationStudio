import fetch from 'unfetch';

const getDocumentsByUser = async (id) => {
  const url = '/api/documents';
  const body = { userId: id };
  const res = await fetch(url, {
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

const getSharedDocumentsByGroup = async (groups) => {
  const url = '/api/documents';
  const body = { groupIds: groups.map((group) => group.id) };
  const res = await fetch(url, {
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

export {
  getDocumentsByUser,
  getSharedDocumentsByGroup,
};
