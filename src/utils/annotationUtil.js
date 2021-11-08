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

const fetchSharedAnnotationsOnDocument = async ({
  slug, page, perPage, cookie, prefetch,
}) => {
  let url = `${prefetch ? appendProtocolIfMissing(process.env.SITE) : ''}/api/annotations?slug=${slug}`;
  if (page !== undefined && perPage !== undefined) {
    url += `&page=${page}&perPage=${perPage}`;
  }
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
  userId, groups, range,
}) => {
  const url = '/api/allAnnotations';
  const groupIds = groups ? groups.map((g) => g.id) : [];
  const body = { userId, groupIds, range };
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const response = await res.json();
    const { annotations, count, packets } = response;
    return Promise.resolve({ annotations, count, packets });
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


const calculateSizeOfDataInMB = ({ data, range = { start: 0, end: undefined } }) => ((encodeURI(JSON.stringify(data.slice(range.start, range.end)).split(/%..|./)).length - 1) / 1024) / 1024;

/*
const calculateDataToSend = (data, limit = 1) => {

  if (calculateSizeOfDataInMB(data) <= limit) {
    return { data, index}
  }

  let index = Math.floor(data.length * 0.75);
  while(calculateSizeOfDataInMB(data.slice(0, index)) > limit) {
    index = Math.floor(index * 0.75)
  }

  return { data, index }
}
*/

const calculatePacketSizes = (data, limit = 1) => {
  // an array of the start and stop indexes of each packet
  const packets = [{
    start: 0,
    end: data.length,
  }];

  let removeIndex = 0;
  let sizeOfPacket = calculateSizeOfDataInMB({ data, range: packets[removeIndex] });
  let resizePackets = sizeOfPacket > limit;
  let percentageResize = null;
  let amountOfIndexesToMove = 0;
  let diff = 0;
  while (resizePackets) {
    percentageResize = limit / sizeOfPacket;
    diff = packets[removeIndex].end - packets[removeIndex].start;
    amountOfIndexesToMove = Math.floor(diff * percentageResize);
    packets[removeIndex].end -= amountOfIndexesToMove;
    sizeOfPacket = calculateSizeOfDataInMB({ data, range: packets[removeIndex] });

    if (sizeOfPacket > limit) {
      resizePackets = true;
    } else if (packets[removeIndex].end < data.length) {
      resizePackets = true;
      // adding a new packet for data that needs to be split into packets
      packets.push({
        start: packets[removeIndex].end + 1,
        end: data.length,
      });
      removeIndex += 1;
      // calculating the size of the new packet we created and setting that as the packet size
      sizeOfPacket = calculateSizeOfDataInMB({ data, range: packets[removeIndex] });
    } else {
      resizePackets = false;
    }
  }

  return packets;
};

export {
  calculatePacketSizes,
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
