import unfetch from 'unfetch';
import { getManyGroupNamesById } from './docUtil';
import { appendProtocolIfMissing } from './fetchUtil';

const deleteAnnotationById = async (id) => {
  const url = `/api/annotation/${id}`;
  const res = await unfetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result);
  } return Promise.reject(Error(`Unable to delete annotation: error ${res.status} received from server`));
};

const getAnnotationById = async (id) => {
  const url = `/api/annotation/${id}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to retrieve annotation: error ${res.status} received from server`));
};

const postAnnotation = async ({
  creator, permissions, body, target,
}) => {
  const requestBody = {
    creator, body, permissions, target,
  };
  if (!body.language) requestBody.body.language = 'en-US';
  const url = '/api/annotation';
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to create annotation: error ${res.status} received from server`));
};

const fetchSharedAnnotationsOnDocument = async ({ slug, cookie, prefetch }) => {
  const url = `${prefetch ? appendProtocolIfMissing(process.env.SITE) : ''}/api/annotations?slug=${slug}`;
  // eslint-disable-next-line no-undef
  const f = prefetch ? fetch : unfetch;
  const res = await f(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations } = response;
    return Promise.resolve(annotations);
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to retrieve annotations: error ${res.status} received from server`));
};

const updateAllAnnotationsByUser = async (user) => {
  const { id, name, email } = user;
  const body = { creatorToUpdate: { id, name, email }, mode: 'userProfile' };
  const url = '/api/annotations';
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations } = response;
    return Promise.resolve(annotations);
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to update annotations: error ${res.status} received from server`));
};

const updateAllAnnotationsOnDocument = async (document) => {
  const body = { documentToUpdate: document, mode: 'documentMetadata' };
  const url = '/api/annotations';
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations } = response;
    return Promise.resolve(annotations);
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to update annotations: error ${res.status} received from server`));
};

const updateAnnotationById = async (id, annotation) => {
  const url = `/api/annotation/${id}`;
  const { body, permissions } = annotation;
  const requestBody = { body, permissions };
  const res = await unfetch(url, {
    method: 'PATCH',
    body: JSON.stringify(requestBody),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    return Promise.resolve(response);
  } return Promise.reject(Error(`Unable to update annotation: error ${res.status} received from server`));
};

const reassignAnnotationsToUser = async (sourceUser, destinationEmail) => {
  const url = `/api/user/email/${destinationEmail}`;
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const destinationUser = await res.json();
    const { id, name } = destinationUser;
    const body = { oldCreatorId: sourceUser.id, newCreator: { id, name, email: destinationEmail }, mode: 'reassign' };
    const annotationsUrl = '/api/annotations';
    const annotationsRes = await unfetch(annotationsUrl, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (annotationsRes.status === 200) {
      const response = await annotationsRes.json();
      const { annotations } = response;
      return Promise.resolve(annotations);
    } if (annotationsRes.status === 404) {
      return Promise.resolve([]);
    } return Promise.reject(Error(`Unable to update annotations: error ${annotationsRes.status} received from server`));
  } return Promise.reject(Error(`Unable to find user with email ${destinationEmail}: error ${res.status} received from server`));
};

const getSharedAnnotations = async ({
  groups, limit, page, perPage,
}) => {
  let url = '/api/annotations';
  if (limit) { url = `${url}?limit=${limit}&`; } else { url = `${url}?`; }
  if (page && perPage) {
    url = `${url}page=${page}&perPage=${perPage}`;
  }
  groups.map((group) => {
    url = `${url}&groupIds[]=${group.id}`;
    return null;
  });
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations, count } = response;
    return Promise.resolve({ annotations, count });
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to retrieve annotations: error ${res.status} received from server`));
};

const getAllAnnotations = async ({
  userId, groups,
}) => {
  let url = `/api/allAnnotations?userId=${userId}`;
  groups.map((group) => {
    url = `${url}&groupIds[]=${group.id}`;
    return null;
  });
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations, count } = response;
    return Promise.resolve({ annotations, count });
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to retrieve annotations: error ${res.status} received from server`));
};

const getOwnAnnotations = async ({
  userId, limit, page, perPage,
}) => {
  let url = `/api/annotations?userId=${userId}`;
  if (limit) { url = `${url}&limit=${limit}`; }
  if (page && perPage) { url = `${url}&page=${page}&perPage=${perPage}`; }
  const res = await unfetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations, count } = response;
    return Promise.resolve({ annotations, count });
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to retrieve annotations: error ${res.status} received from server`));
};

const addGroupNamesToAnnotations = async (annosToAlter) => {
  const allGroupIds = [];
  if (annosToAlter
    && Array.isArray(annosToAlter)
    && annosToAlter.length > 0) {
    annosToAlter.forEach((annotation) => {
      if (annotation.permissions
          && Array.isArray(annotation.permissions.groups)
          && annotation.permissions.groups.length > 0) {
        annotation.permissions.groups.forEach((group) => {
          if (!allGroupIds.includes(group)) { allGroupIds.push(group); }
        });
      }
    });
  }
  const groupObjects = await getManyGroupNamesById(allGroupIds)
    .then((res) => res.groups);
  const altered = Promise.all(annosToAlter.map(async (annotation) => {
    const anno = annotation;
    let alteredGroups = [];
    if (annotation.permissions.groups) {
      alteredGroups = annotation.permissions.groups.map(
        // eslint-disable-next-line no-underscore-dangle
        (group) => groupObjects.find((groupObject) => groupObject._id === group),
      );
    }
    const alteredPermissions = { ...anno.permissions, groups: alteredGroups };
    return { ...anno, permissions: alteredPermissions };
  }));
  return altered;
};

export {
  addGroupNamesToAnnotations,
  deleteAnnotationById,
  getAnnotationById,
  getOwnAnnotations,
  getSharedAnnotations,
  getAllAnnotations,
  postAnnotation,
  fetchSharedAnnotationsOnDocument,
  reassignAnnotationsToUser,
  updateAllAnnotationsByUser,
  updateAllAnnotationsOnDocument,
  updateAnnotationById,
};
