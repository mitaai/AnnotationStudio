/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import SlateToolbar from './SlateToolbar';

jest.mock('slate-react', () => ({
  useSlate() {
    return {};
  },
}));

jest.mock('../../utils/slateUtil', () => ({
  BlockButton() { return <div />; },
  MarkButton() { return <div />; },
  videoURLtoEmbedURL: jest.fn,
  insertVideoEmbed: jest.fn,
}));

jest.mock('@udecode/slate-plugins', () => ({
  ToolbarImage() { return <div />; },
  ToolbarAlign() { return <div />; },
  ToolbarButton() { return <div />; },
  ToolbarList() { return <div />; },
  ToolbarLink() { return <div />; },
  isNodeTypeIn: jest.fn,
  toggleNodeType: jest.fn,
  DEFAULTS_ALIGN: {
    align_left: { type: 'align_left' },
    align_center: { type: 'align_center' },
    align_right: { type: 'align_right' },
  },
  DEFAULTS_BLOCKQUOTE: { blockquote: { type: 'blockquote' } },
  DEFAULTS_CODE_BLOCK: { code_block: { type: 'code_block' } },
  DEFAULTS_HEADING: {
    h1: { type: 'h1' },
    h2: { type: 'h2' },
    h3: { type: 'h3' },
    h4: { type: 'h4' },
    h5: { type: 'h5' },
    h6: { type: 'h6' },
  },
  DEFAULTS_IMAGE: {},
  DEFAULTS_LINK: {},
  DEFAULTS_LIST: { ul: { type: 'ul' }, ol: { type: 'ol' } },
  ELEMENT_MEDIA_EMBED: 'media_embed',
}));

test('renders slate toolbar', async () => {
  const { getByTestId } = render(
    <SlateToolbar />,
  );
  const toolbar = getByTestId('slate-toolbar');
  expect(toolbar).toBeInTheDocument();
});
