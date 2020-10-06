import assert from 'assert';

/* eslint-disable import/prefer-default-export */
const deepEqual = (a, b) => {
  try {
    assert.deepStrictEqual(a, b);
  } catch (error) {
    if (error.name === 'AssertionError') {
      return false;
    }
    throw error;
  }
  return true;
};

export { deepEqual };
