/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-param-reassign */
import { jsx } from 'slate-hyperscript';
import {
  Editor,
  Point,
  Range,
  Transforms,
  Text,
} from 'slate';
import {
  useFocused,
  useSelected,
  useSlate,
} from 'slate-react';
import { Button } from 'react-bootstrap';
import escapeHtml from 'escape-html';

// Helper constants

const ELEMENT_TAGS = {
  A: (el) => ({ type: 'link', url: el.getAttribute('href') }),
  BLOCKQUOTE: () => ({ type: 'quote' }),
  H1: () => ({ type: 'heading-one' }),
  H2: () => ({ type: 'heading-two' }),
  H3: () => ({ type: 'heading-three' }),
  H4: () => ({ type: 'heading-four' }),
  H5: () => ({ type: 'heading-five' }),
  H6: () => ({ type: 'heading-six' }),
  IMG: (el) => ({ type: 'image', url: el.getAttribute('src') }),
  LI: () => ({ type: 'list-item' }),
  OL: () => ({ type: 'numbered-list' }),
  P: () => ({ type: 'paragraph' }),
  PRE: () => ({ type: 'code' }),
  // TABLE: () => ({ type: 'table' }),
  // TBODY: () => ({ type: 'table-body' }),
  // TD: (el) => ({ type: 'table-cell', colspan: el.getAttribute('colspan') }),
  // TH: (el) => ({ type: 'table-header', colspan: el.getAttribute('colspan') }),
  // TR: () => ({ type: 'table-row' }),
  UL: () => ({ type: 'bulleted-list' }),
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true }),
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

// Serailization and deserialization functions

const serialize = (node) => {
  if (Text.isText(node)) {
    return escapeHtml(node.text);
  }

  const children = (!node.children || node.children.length === 0)
    ? '<br />'
    : node.children.map((n) => serialize(n)).join('');

  if (children === '') {
    return '<br />';
  }

  switch (node.type) {
    default:
      return `<p>${children}</p>`;
    case 'quote':
      return `<blockquote>${children}</blockquote>`;
    case 'code':
      return (
        `<pre>
          <code>${children}</code>
        </pre>`
      );
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'heading-one':
      return `<h1>${children}</h1>`;
    case 'heading-two':
      return `<h2>${children}</h2>`;
    case 'heading-three':
      return `<h3>${children}</h3>`;
    case 'heading-four':
      return `<h4>${children}</h4>`;
    case 'heading-five':
      return `<h5>${children}</h5>`;
    case 'heading-six':
      return `<h6>${children}</h6>`;
    case 'list-item':
      return `<li>${children}</li>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'link':
      return (
        `<a href="${escapeHtml(node.url)}">${children}</a>`
      );
    case 'image':
      return `<div>
      ${children}
      <img
        src=${escapeHtml(node.url)}
      />
    </div>`;
    // case 'table':
    //   return `<table>${children}
    //     </table>`;
    // case 'table-body':
    //   return `<tbody>${children}</tbody>`;
    // case 'table-row':
    //   return `<tr>${children}</tr>`;
    // case 'table-cell':
    //   return `<td colspan="${node.colspan ? node.colspan : ''}">${children}</td>`;
    // case 'table-header':
    //   return `<th colspan="${node.colspan ? node.colspan : ''}>${children}</th>`;
  }
};

const deserialize = (el) => {
  if (el.nodeType === 3) {
    return el.textContent;
  } if (el.nodeType !== 1) {
    return null;
  } if (el.nodeName === 'BR') {
    return '\n';
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === 'PRE'
    && el.childNodes[0]
    && el.childNodes[0].nodeName === 'CODE'
  ) {
    // eslint-disable-next-line prefer-destructuring
    parent = el.childNodes[0];
  }
  const children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx('element', attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map((child) => jsx('text', attrs, child));
  }

  return children;
};

// Helper functions

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => n.type === format,
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};


const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: (n) => LIST_TYPES.includes(n.type),
    split: true,
  });

  let type = format;

  if (isActive) {
    type = 'paragraph';
  } else if (isList) {
    type = 'list-item';
  }

  Transforms.setNodes(editor, { type });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Defining Element and Leaf

const Element = (props) => {
  const { attributes, element } = props;
  let { children } = props;

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  switch (element.type) {
    default:
      return <p {...attributes}>{children}</p>;
    case 'quote':
      return <blockquote {...attributes}>{children}</blockquote>;
    case 'code':
      return (
        <pre>
          <code {...attributes}>{children}</code>
        </pre>
      );
    case 'bulleted-list':
      return <ul {...attributes}>{children}</ul>;
    case 'heading-one':
      return <h1 {...attributes}>{children}</h1>;
    case 'heading-two':
      return <h2 {...attributes}>{children}</h2>;
    case 'heading-three':
      return <h3 {...attributes}>{children}</h3>;
    case 'heading-four':
      return <h4 {...attributes}>{children}</h4>;
    case 'heading-five':
      return <h5 {...attributes}>{children}</h5>;
    case 'heading-six':
      return <h6 {...attributes}>{children}</h6>;
    case 'list-item':
      return <li {...attributes}>{children}</li>;
    case 'numbered-list':
      return <ol {...attributes}>{children}</ol>;
    case 'link':
      return (
        <a href={element.url} {...attributes}>
          {children}
        </a>
      );
    case 'image':
      return <ImageElement {...props} />;
    // case 'table':
    //   return (
    //     <table {...attributes} style={{ border: '1px solid #333' }}>{children}</table>
    //   );
    // case 'table-body':
    //   return (
    //     <tbody {...attributes}>{children}</tbody>
    //   );
    // case 'table-row':
    //   return <tr {...attributes}>{children}</tr>;
    // case 'table-cell':
    //   return <td colSpan={element.colspan} {...attributes}>{children}</td>;
    // case 'table-header':
    //   return <th colSpan={element.colspan} {...attributes}>{children}</th>;
  }
};

const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <div {...attributes}>
      {children}
      <img
        src={element.url}
        className={`${selected && focused ? 'imgSelected' : ''}`}
      />
    </div>
  );
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <del>{children}</del>;
  }

  return <span {...attributes}>{children}</span>;
};

// Plugins

const withHtml = (editor) => {
  const { insertData, isInline, isVoid } = editor;

  editor.isInline = (element) => (element.type === 'link' ? true : isInline(element));

  editor.isVoid = (element) => (element.type === 'image' ? true : isVoid(element));

  editor.insertData = (data) => {
    const html = data.getData('text/html');

    if (html) {
      // eslint-disable-next-line no-undef
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      const fragment = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragment);
      return;
    }

    insertData(data);
  };

  return editor;
};

const withTables = (editor) => {
  const { deleteBackward, deleteForward, insertBreak } = editor;

  editor.deleteBackward = (unit) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) => n.type === 'table-cell',
      });
      if (cell) {
        const [, cellPath] = cell;
        const start = Editor.start(editor, cellPath);
        if (Point.equals(selection.anchor, start)) {
          return;
        }
      }
    }
    deleteBackward(unit);
  };

  editor.deleteForward = (unit) => {
    const { selection } = editor;
    if (selection && Range.isCollapsed(selection)) {
      const [cell] = Editor.nodes(editor, {
        match: (n) => n.type === 'table-cell',
      });
      if (cell) {
        const [, cellPath] = cell;
        const end = Editor.end(editor, cellPath);
        if (Point.equals(selection.anchor, end)) {
          return;
        }
      }
    }
    deleteForward(unit);
  };

  editor.insertBreak = () => {
    const { selection } = editor;
    if (selection) {
      const [table] = Editor.nodes(editor, { match: (n) => n.type === 'table' });
      if (table) {
        return;
      }
    }
    insertBreak();
  };
  return editor;
};

// Toolbar UI elements

const BlockButton = ({ format, className, children }) => {
  const editor = useSlate();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline-secondary"
      className={className}
      active={isBlockActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {children}
    </Button>
  );
};

const MarkButton = ({ format, className, children }) => {
  const editor = useSlate();
  return (
    <Button
      type="button"
      size="sm"
      variant="outline-secondary"
      className={className}
      active={isMarkActive(editor, format)}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {children}
    </Button>
  );
};

export {
  BlockButton,
  Element,
  Leaf,
  MarkButton,
  deserialize,
  serialize,
  withHtml,
  withTables,
};
