/* eslint-disable jsx-a11y/iframe-has-title */
import { convertNodeToElement } from 'react-html-parser';

// eslint-disable-next-line import/prefer-default-export
export const fixIframes = (node, index) => {
  const {
    children, name, attribs,
  } = node;
  if (name === 'iframe') {
    return (
      <iframe
        src={attribs.src}
        allowFullScreen={attribs.allowfullscreen}
        style={{ maxWidth: '100%' }}
        key={attribs.src}
      >
        {children.map((child) => convertNodeToElement(child, index, fixIframes))}
      </iframe>
    );
  }
  return undefined;
};
