const StripQuery = (uri) => {
  const stripped = (uri.lastIndexOf('?') !== -1) ? uri.substring(0, uri.lastIndexOf('?')) : uri;
  return (stripped.lastIndexOf('#') !== -1) ? stripped.substring(0, stripped.lastIndexOf('#')) : stripped;
};

const ucFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// eslint-disable-next-line import/prefer-default-export
export { StripQuery, ucFirst };
