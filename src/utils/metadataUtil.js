/* eslint-disable import/prefer-default-export */

const publicationFieldName = (type) => {
  switch (type) {
    case 'Book Section': return 'Book title';
    case 'Journal Article': return 'Journal title';
    case 'Newspaper Article': return 'Newspaper title';
    case 'Magazine Article': return 'Magazine title';
    case 'Web Page': return 'Website title';
    default: return 'Publication title';
  }
};

export { publicationFieldName };
