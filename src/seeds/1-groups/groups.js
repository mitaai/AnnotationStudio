import getObjectId from '../../utils/seedUtil';

const name = 'Public Domain Literature';
const docTitle = 'Afterward';
const dateCreated = Date.now();

const group = {
  id: getObjectId(name),
  name,
  members: [],
  documents: [getObjectId(docTitle)],
  createdAt: dateCreated,
  updatedAt: dateCreated,
};

module.exports = group;
