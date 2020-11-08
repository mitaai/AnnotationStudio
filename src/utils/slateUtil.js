import {
  Editor,
} from 'slate';
import {
  useSlate,
} from 'slate-react';
import { Button } from 'react-bootstrap';

// Helper constants

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

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
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
  MarkButton,
};
