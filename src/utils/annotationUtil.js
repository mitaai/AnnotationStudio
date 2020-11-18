import unfetch from 'unfetch';

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

const prefetchSharedAnnotationsOnDocument = async (slug, cookie) => {
  const url = `${process.env.SITE}/api/annotations?slug=${slug}`;
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

const getSharedAnnotations = async (groups, limit) => {
  let url = `/api/annotations?limit=${limit}`;
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
    const { annotations } = response;
    return Promise.resolve(annotations);
  } if (res.status === 404) {
    return Promise.resolve([]);
  } return Promise.reject(Error(`Unable to retrieve annotations: error ${res.status} received from server`));
};

const getOwnAnnotations = async (userId, limit) => {
  const url = `/api/annotations?userId=${userId}&limit=${limit}`;
  const res = await unfetch(url, {
    method: 'GET',
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
  } return Promise.reject(Error(`Unable to retrieve annotations: error ${res.status} received from server`));
};

export {
  deleteAnnotationById,
  getAnnotationById,
  getOwnAnnotations,
  getSharedAnnotations,
  postAnnotation,
  prefetchSharedAnnotationsOnDocument,
  reassignAnnotationsToUser,
  updateAllAnnotationsByUser,
  updateAllAnnotationsOnDocument,
  updateAnnotationById,
};
