import {
  Editor, Transforms,
} from 'slate';
import {
  useSlate,
} from 'slate-react';
import {
  AlignPlugin,
  BlockquotePlugin,
  BoldPlugin,
  CodeBlockPlugin,
  CodePlugin,
  ExitBreakPlugin,
  HeadingPlugin,
  ImagePlugin,
  ItalicPlugin,
  LinkPlugin,
  ListPlugin,
  MediaEmbedPlugin,
  ParagraphPlugin,
  SoftBreakPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  TablePlugin,
  TodoListPlugin,
  UnderlinePlugin,
  DEFAULTS_ALIGN,
  DEFAULTS_BOLD,
  DEFAULTS_BLOCKQUOTE,
  DEFAULTS_CODE,
  DEFAULTS_CODE_BLOCK,
  DEFAULTS_HEADING,
  DEFAULTS_ITALIC,
  DEFAULTS_LINK,
  DEFAULTS_LIST,
  DEFAULTS_IMAGE,
  DEFAULTS_PARAGRAPH,
  DEFAULTS_STRIKETHROUGH,
  DEFAULTS_SUBSUPSCRIPT,
  DEFAULTS_TABLE,
  DEFAULTS_TODO_LIST,
  DEFAULTS_UNDERLINE,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
  ELEMENT_MEDIA_EMBED,
} from '@udecode/slate-plugins';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SlateMediaEmbedElement from '../components/SlateMediaEmbedElement';

// Helper constants
const SoftBreakPluginOptions = {
  rules: [
    { hotkey: 'shift+enter' },
    {
      hotkey: 'enter',
      query: {
        allow: [
          DEFAULTS_CODE_BLOCK.code_block.type,
          DEFAULTS_BLOCKQUOTE.blockquote.type,
          DEFAULTS_TABLE.td.type,
        ],
      },
    },
  ],
};

const ExitBreakPluginOptions = {
  rules: [
    {
      hotkey: 'mod+enter',
    },
    {
      hotkey: 'mod+shift+enter',
      before: true,
    },
    {
      hotkey: 'enter',
      query: {
        start: true,
        end: true,
        allow: [
          ELEMENT_H1,
          ELEMENT_H2,
          ELEMENT_H3,
          ELEMENT_H4,
          ELEMENT_H5,
          ELEMENT_H6,
        ],
      },
    },
  ],
};

const tooltipText = {
  bold: 'Bold',
  italic: 'Italic',
  underline: 'Underline',
  strikethrough: 'Strikethrough',
  'align-left': 'Align left',
  'align-right': 'Align right',
  'align-center': 'Align center',
  'bulleted-list': 'Unordered list',
  'numbered-list': 'Ordered list',
  link: 'Link',
  image: 'Insert image',
};

const customMediaEmbedPluginOptions = {
  component: SlateMediaEmbedElement,
  type: ELEMENT_MEDIA_EMBED,
  rootProps: {
    className: 'slate-media-embed',
  },
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

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const videoURLtoEmbedURL = (url) => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const urlSplit = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    // eslint-disable-next-line no-useless-escape
    const videoId = urlSplit[2] ? urlSplit[2].split(/[^0-9a-z_\-]/i)[0] : urlSplit;
    return (videoId === null || !videoId) ? null : `https://www.youtube.com/embed/${videoId}?modestbranding=1`;
  }
  if (url.includes('vimeo.com')) {
    const urlSplit = /vimeo.*\/(\d+)/i.exec(url);
    const videoId = urlSplit ? null : urlSplit[1];
    return (videoId === null || !videoId) ? null : `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`;
  }
  return null;
};

const insertVideoEmbed = (editor, url) => {
  const text = { text: '' };
  const video = { type: ELEMENT_MEDIA_EMBED, url, children: [text] };
  Transforms.insertNodes(editor, video);
};

// Toolbar UI elements
const BlockButton = ({ format, className, children }) => {
  const editor = useSlate();
  return (
    <OverlayTrigger overlay={<Tooltip>{tooltipText[format]}</Tooltip>}>
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
    </OverlayTrigger>
  );
};

const MarkButton = ({ format, className, children }) => {
  const editor = useSlate();
  return (
    <OverlayTrigger overlay={<Tooltip>{tooltipText[format]}</Tooltip>}>
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
    </OverlayTrigger>
  );
};

// @udecode slate plugins

const plugins = [
  AlignPlugin(DEFAULTS_ALIGN),
  BoldPlugin({
    bold: {
      ...DEFAULTS_BOLD.bold,
      rootProps: {
        as: 'strong',
      },
    },
  }),
  BlockquotePlugin(DEFAULTS_BLOCKQUOTE),
  CodePlugin(DEFAULTS_CODE),
  CodeBlockPlugin(DEFAULTS_CODE_BLOCK),
  HeadingPlugin(DEFAULTS_HEADING),
  ImagePlugin(DEFAULTS_IMAGE),
  ItalicPlugin(DEFAULTS_ITALIC),
  LinkPlugin(DEFAULTS_LINK),
  ListPlugin(DEFAULTS_LIST),
  MediaEmbedPlugin(customMediaEmbedPluginOptions),
  ParagraphPlugin(DEFAULTS_PARAGRAPH),
  StrikethroughPlugin(DEFAULTS_STRIKETHROUGH),
  SubscriptPlugin(DEFAULTS_SUBSUPSCRIPT),
  SuperscriptPlugin(DEFAULTS_SUBSUPSCRIPT),
  TablePlugin(DEFAULTS_TABLE),
  TodoListPlugin(DEFAULTS_TODO_LIST),
  UnderlinePlugin(DEFAULTS_UNDERLINE),
  SoftBreakPlugin(SoftBreakPluginOptions),
  ExitBreakPlugin(ExitBreakPluginOptions),
];

export {
  BlockButton,
  MarkButton,
  plugins,
  videoURLtoEmbedURL,
  insertVideoEmbed,
};
