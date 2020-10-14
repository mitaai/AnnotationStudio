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

export {
  deleteAnnotationById,
  getAnnotationById,
  postAnnotation,
  prefetchSharedAnnotationsOnDocument,
  updateAnnotationById,
};
