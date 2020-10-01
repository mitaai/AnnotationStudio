const fs = require('fs');
const path = require('path');
const { getObjectId } = require('mongo-seeding');

const title = 'Afterward';
const groupName = 'Public Domain Literature';
const dateCreated = new Date(Date.now());
const filename = `${path.resolve(__dirname)}/../wharton_afterward.html`;
const docText = fs.readFileSync(filename, 'utf8');

const documents = [{
  id: getObjectId(title),
  title,
  slug: 'afterward',
  owner: getObjectId('FakeUserReplaceMe'),
  groups: [getObjectId(groupName)],
  resource_type: 'Book Section',
  author: 'Edith Wharton',
  publisher: '(MacMillan and Co.) Project Gutenberg',
  publication_date: '(1910) 2003',
  book_title: 'Tales Of Men And Ghosts',
  edition: 'Project Gutenberg eBook',
  url: 'http://www.gutenberg.org/files/4514/4514-h/4514-h.htm',
  accessed: 'July 16, 2020',
  rights_status: 'Public Domain',
  location: 'London',
  state: 'published',
  text: docText,
  createdAt: dateCreated,
  updatedAt: dateCreated,
}];

module.exports = documents;
