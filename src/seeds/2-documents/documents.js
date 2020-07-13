import getObjectId from '../../utils/seedUtil';

const title = 'Afterward';
const groupName = 'Public Domain Literature';
const dateCreated = Date.now();

const documents = [{
  id: getObjectId(title),
  title,
  author: 'Edith Wharton',
  publisher: 'Project Gutenberg [MacMillan and Co.]',
  publication_date: '2003 [1910]',
  location: 'London',
  groups: [getObjectId(groupName)],
  state: 'published',
  createdAt: dateCreated,
  updatedAt: dateCreated,
}];

module.exports = documents;
