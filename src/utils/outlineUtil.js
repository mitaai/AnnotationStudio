import unfetch from 'unfetch';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import { serializeHTMLFromNodes } from '@udecode/slate-plugins';
import { plugins } from './slateUtil';

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
    return Promise.resolve(result);
  }
  return Promise.reject(Error(`Unable to create idea space: error ${res.status} received from server`));
};

const getOutlineById = async (id) => {
  const url = `/api/outline/${id}`;
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

const exportDocumentToAnnotationStudio = async ({ author = '', composition, callback }) => {
  const slug = `${slugify(composition.name)}-${cryptoRandomString({ length: 5, type: 'hex' })}`;

  const body = {
    title: composition.name,
    contributors: [{ type: 'Author', name: author }],
    groups: [],
    resourceType: 'Other',
    rightsStatus: 'Copyrighted',
    slug,
    state: 'published',
    uploadContentType: 'text/slate-html',
    text: serializeHTMLFromNodes({ plugins, nodes: composition.document }),
  };

  const postUrl = '/api/document';

  const res = await unfetch(postUrl, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 200) {
    await res.json();
    callback({
      pathname: `/documents/${slug}/edit`,
      query: {
        exportDocument: true,
      },
    });
  }
};

export {
  createOutline,
  getAllOutlines,
  getOutlineById,
  updateOutlineData,
  deleteOutline,
  exportDocumentToAnnotationStudio,
};
