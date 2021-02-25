// eslint-disable-next-line import/prefer-default-export
export const appendProtocolIfMissing = (url) => {
  if (url && !url.startsWith('http')) {
    return `https://${url}`;
  }
  return url;
};
