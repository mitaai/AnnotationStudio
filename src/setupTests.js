/* eslint-disable import/no-extraneous-dependencies */
// optional: configure or set up a testing framework before each test
// if you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// used for __tests__/testing-library.js
// learn more: https://github.com/testing-library/jest-dom

import '@testing-library/jest-dom/extend-expect';

import fs from 'fs';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

afterAll(() => {
  // Unlink config used in jest-mongodb
  fs.unlink(`${process.cwd()}/globalConfig.json`, () => {});
});
