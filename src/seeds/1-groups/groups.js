const { getObjectId } = require('mongo-seeding');


const name = 'Public Domain Literature';
const docTitle = 'Afterward';
const dateCreated = new Date(Date.now());

const group = {
  id: getObjectId(name),
  name,
  members: [{
    id: getObjectId('FakeUserReplaceMe'),
    name: 'Fake User',
    email: 'fake.user@email.com',
    role: 'owner',
  }],
  documents: [{
    id: getObjectId(docTitle),
    name: docTitle,
    slug: 'afterward',
  }],
  createdAt: dateCreated,
  updatedAt: dateCreated,
};

module.exports = group;
