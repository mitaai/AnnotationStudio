const upperCaseFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const escapeRegExp = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// eslint-disable-next-line import/prefer-default-export
export { upperCaseFirstLetter, escapeRegExp };
