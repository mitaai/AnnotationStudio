/* eslint-disable import/prefer-default-export */
const uploadSlateToS3 = async ({ textToUpload }) => {
  const file = Buffer.from(textToUpload);
  let queryString = `?objectName=${encodeURIComponent('slate.html')}`;
  queryString += `&contentType=${encodeURIComponent('text/html')}`;
  queryString += `&path=${encodeURIComponent('processed/')}`;
  queryString += '&mode=slate';
  const signingUrl = `${process.env.NEXT_PUBLIC_SIGNING_URL}${queryString}`;

  // eslint-disable-next-line no-undef
  const urlRes = await fetch(signingUrl, {
    method: 'GET',
  });
  const signRes = await urlRes.json();
  const { signedUrl } = signRes;
  const fileUrl = signedUrl.substring(
    0, signedUrl.indexOf('?'),
  );
  // eslint-disable-next-line no-undef
  await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': 'text/html',
      'x-amz-acl': 'public-read',
    },
  });
  return fileUrl;
};

export { uploadSlateToS3 };
