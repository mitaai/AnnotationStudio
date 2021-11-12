import unfetch from 'unfetch';
import { appendProtocolIfMissing } from './fetchUtil';

const getDocumentsByUser = async ({
  id, limit, page, perPage, noDrafts,
}) => {
  const url = '/api/documents2';
  const body = {
    userId: id, limit, page, perPage, noDrafts,
  };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { documents, count } = response;
    return Promise.resolve({ docs: documents, count });
  } return Promise.reject(Error(`Unable to retrieve documents: error ${res.status} received from server`));
};

const prefetchDocumentBySlug = async (slug, cookie) => {
  const url = `${appendProtocolIfMissing(process.env.SITE)}/api/document/slug/${slug}`;
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
  const url = '/api/documents2';
  const body = { groupIds: groups.map((group) => group.id) };
  const res = await unfetch(url, {
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

const getSharedDocumentsByGroup = async ({
  groups,
  limit,
  page,
  perPage,
}) => {
  const url = '/api/documents2';
  const body = {
    groupIds: groups.map((group) => group.id),
    limit,
    page,
    perPage,
    noDrafts: true,
  };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { documents, count } = response;
    return Promise.resolve({ docs: documents, count });
  } return Promise.reject(Error(`Unable to retrieve documents: error ${res.status} received from server`));
};

const getDocumentsByGroupByUser = async ({
  groups,
  skip,
  page,
  perPage,
  id,
  mine,
  noDrafts,
  sort,
}) => {
  const url = '/api/documents2';
  const body = {
    userId: mine ? id : undefined,
    groupIds: groups.map((group) => group.id),
    skip,
    page,
    perPage,
    noDrafts,
    sort,
  };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { documents, count } = response;
    return Promise.resolve({ docs: documents, count });
  } return Promise.reject(Error(`Unable to retrieve documents: error ${res.status} received from server`));
};

const deleteDocumentById = async (id) => {
  const url = `/api/document/${id}`;
  const res = await unfetch(url, {
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

const prefetchManyGroupNamesById = async (groupIds, cookie) => {
  const url = `${appendProtocolIfMissing(process.env.SITE)}/api/groups`;
  const body = { groupIds };
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to fecth group names: error ${res.status} received from server`));
};

const getManyGroupNamesById = async (groupIds) => {
  const url = '/api/groups';
  const body = { groupIds };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to fecth group names: error ${res.status} received from server`));
};

const searchForUsers = async ({
  query, page, perPage, sort,
}) => {
  const url = '/api/search/users';
  const body = {
    query, page, perPage, sort,
  };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to fecth group names: error ${res.status} received from server`));
};

const searchForDocuments = async ({
  query, page, perPage, sort,
}) => {
  const url = '/api/search/documents';
  const body = {
    query, page, perPage, sort,
  };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to fecth group names: error ${res.status} received from server`));
};

const searchForGroups = async ({
  query, page, perPage, sort,
}) => {
  const url = '/api/search/groups';
  const body = {
    query, page, perPage, sort,
  };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to fecth group names: error ${res.status} received from server`));
};

const addGroupNamesToDocuments = async (docsToAlter) => {
  const allGroupIds = [];
  if (docsToAlter
    && Array.isArray(docsToAlter)
    && docsToAlter.length > 0) {
    docsToAlter.forEach((doc) => {
      if (doc.groups
        && Array.isArray(doc.groups)
        && doc.groups.length > 0) {
        doc.groups.forEach((group) => {
          if (!allGroupIds.includes(group)) { allGroupIds.push(group); }
        });
      }
    });
  }
  const groupObjects = await getManyGroupNamesById(allGroupIds)
    .then((res) => res.groups);
  const altered = Promise.all(docsToAlter.map(async (document) => {
    const doc = document;
    let alteredGroups = [];
    if (document.groups) {
      alteredGroups = document.groups.map(
        // eslint-disable-next-line no-underscore-dangle
        (group) => groupObjects.find((groupObject) => groupObject._id === group),
      );
    }
    return { ...doc, groups: alteredGroups };
  }));
  return altered;
};

export {
  addGroupNamesToDocuments,
  deleteDocumentById,
  getAllDocumentsByGroup,
  getDocumentsByUser,
  getManyGroupNamesById,
  getSharedDocumentsByGroup,
  searchForUsers,
  searchForDocuments,
  searchForGroups,
  getDocumentsByGroupByUser,
  prefetchDocumentBySlug,
  prefetchManyGroupNamesById,
};
