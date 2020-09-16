import jwt from 'next-auth/jwt';

const secret = process.env.AUTH_SECRET;

const postDocument = async (req, res) => {
  const token = await jwt.getToken({ req, secret });
  if (token && token.exp > 0) {
    const dateCreated = new Date(Date.now());
    const {
      title,
      slug,
      groups,
      resourceType,
      authors,
      publisher,
      publicationDate,
      bookTitle,
      edition,
      url,
      accessed,
      rightsStatus,
      location,
      state,
      text,
      uploadContentType,
      editors,
      volume,
      issue,
      pageNumbers,
      publication,
      series,
      sesiesNumber,
      notes,
    } = req.body;
    const metadata = {
      title,
      slug,
      groups,
      resourceType,
      authors,
      publisher,
      publicationDate,
      bookTitle,
      edition,
      url,
      accessed,
      rightsStatus,
      location,
      state,
      text,
      uploadContentType,
      editors,
      volume,
      issue,
      pageNumbers,
      publication,
      series,
      sesiesNumber,
      notes,
    };
    Object.keys(metadata).forEach((key) => {
      if (metadata[key] === undefined) {
        delete metadata[key];
      }
    });
    if (Object.keys(metadata).length === 0) {
      res.status(400).json({ error: '400 No request body' });
    } else if (!metadata.title) {
      res.status(400).json({ error: '400 Missing title' });
    } else {
      await req.db
        .collection('documents')
        .insert(
          {
            owner: token.user.id,
            createdAt: dateCreated,
            updatedAt: dateCreated,
            ...metadata,
          },
          (err, doc) => {
            if (err) throw err;
            res.status(200).json(doc);
          },
        );
    }
  } else res.status(403).json({ error: '403 Invalid or expired token' });
};
export default postDocument;