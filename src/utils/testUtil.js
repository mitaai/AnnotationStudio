const document = {
  _id: 'documenttestid',
  title: 'test',
  state: 'draft',
  contributors: [],
  createdAt: '2881-10-05T14:48:00.000',
  updatedAt: '2881-10-05T14:48:00.000',
  owner: 'testestestest',
  groups: [],
};

const user = {
  id: '1',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@email.com',
  affiliation: 'Jest Tests',
  groups: [{
    id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
  }],
  createdAt: '2881-10-05T14:48:00.000',
  updatedAt: '2881-10-05T14:48:00.000',
};

const group = {
  id: 'abcd1234',
  name: 'Test Group',
  members: [{
    id: '1',
    email: 'test@email.com',
    name: 'Test User',
    role: 'owner',
  }],
  inviteUrl: '',
  createdAt: '2881-10-05T14:48:00.000',
  updatedAt: '2881-10-05T14:48:00.000',
};

const annotation = {
  _id: '123456',
  type: 'Annotation',
  creator: {
    id: '1',
    name: 'Test User',
    email: 'test@email.com',
  },
  permissions: {
    groups: [
      '4321bcda',
    ],
    documentOwner: false,
    private: true,
  },
  created: '2020-11-17T23:08:10.332Z',
  modified: '2020-11-18T06:20:39.163Z',
  body: {
    type: 'TextualBody',
    value: 'Test body',
    tags: ['test0', 'test1'],
    format: 'text/html',
    language: 'en',
  },
  target: {
    document: {
      slug: '',
      id: '987654321',
      title: 'Test',
      owner: '1',
      groups: [
        '4321bcda',
      ],
      resourceType: 'Book',
      contributors: [
        {
          name: 'Fake Author',
        },
        {
          type: 'Editor',
          name: 'Fake Editor',
        },
        {
          type: 'Translator',
          name: 'Fake Tanslator',
        },
      ],
      rightsStatus: 'Copyrighted',
      state: 'published',
      createdAt: '2020-11-16T23:08:38.074Z',
      updatedAt: '2020-11-18T06:20:19.894Z',
      format: 'text/html',
    },
    selector: {
      type: 'TextQuoteSelector',
      exact: 'This reading sees identity politics as emerging from a historical moment that opposes the development of a mass anti-capitalist politics',
      prefix: 'ass-based politics. ',
      suffix: ', and, being symptom',
    },
  },
};

const adminUserSession = {
  user: {
    name: 'Admin User',
    email: 'admin@email.com',
    groups: [{
      id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
    }],
    role: 'admin',
  },
  expires: '2881-10-05T14:48:00.000',
};

const userSession = {
  user: {
    name: 'Test User',
    email: 'test@email.com',
    groups: [{
      id: 'abcd1234', name: 'Test Group', ownerName: 'Test User', memberCount: 2, role: 'owner',
    }],
    role: 'user',
  },
  expires: '2881-10-05T14:48:00.000',
};

export {
  adminUserSession,
  annotation,
  document,
  group,
  user,
  userSession,
};
