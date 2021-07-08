import {
  Button, Dropdown, OverlayTrigger, Tooltip, DropdownButton,
} from 'react-bootstrap';
import {
  CameraVideoFill,
  Image,
  Link45deg,
  ListOl,
  ListUl,
  TextCenter,
  TextLeft,
  TextRight,
  Type,
  TypeBold,
  TypeItalic,
  TypeStrikethrough,
  TypeUnderline,
} from 'react-bootstrap-icons';
import { useSlate } from 'slate-react';
import {
  DEFAULTS_ALIGN,
  DEFAULTS_BLOCKQUOTE,
  DEFAULTS_CODE_BLOCK,
  DEFAULTS_HEADING,
  DEFAULTS_IMAGE,
  DEFAULTS_LINK,
  DEFAULTS_LIST,
  ELEMENT_MEDIA_EMBED,
  ToolbarAlign,
  ToolbarButton,
  ToolbarList,
  ToolbarLink,
  ToolbarImage,
  someNode,
  toggleNodeType,
} from '@udecode/slate-plugins';
import {
  BlockButton,
  MarkButton,
  videoURLtoEmbedURL,
  insertVideoEmbed,
} from '../../utils/slateUtil';
import styles from './SlateToolbar.module.scss';

const SlateToolbar = ({ disabled, exportButton, exportDocument = () => {} }) => {
  const editor = useSlate();
  return (
    <div
      className={styles['slate-toolbar']}
      data-testid="slate-toolbar"
    >
      <Dropdown disabled={disabled}>
        <OverlayTrigger overlay={<Tooltip>Styles</Tooltip>}>
          <Dropdown.Toggle
            size="sm"
            variant="outline-secondary"
            className={styles['button-group-end']}
          >
            <Type />
          </Dropdown.Toggle>
        </OverlayTrigger>
        <Dropdown.Menu>
          <Dropdown.Item
            active={
              someNode(editor, { match: { type: DEFAULTS_BLOCKQUOTE.blockquote.type } })
            }
            eventKey="blockquote"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_BLOCKQUOTE.blockquote.type,
                });
              }
            }
          >
            <blockquote className="slate-blockquote">Quote</blockquote>
          </Dropdown.Item>
          <Dropdown.Item
            active={
              someNode(editor, { match: { type: DEFAULTS_CODE_BLOCK.code_block.type } })
            }
            eventKey="codeBlock"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_CODE_BLOCK.code_block.type,
                });
              }
            }
          >
            <pre className="slate-code-block">Code</pre>
          </Dropdown.Item>
          <Dropdown.Item
            active={
              someNode(editor, { match: { type: DEFAULTS_HEADING.h1.type } })
            }
            eventKey="h1"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_HEADING.h1.type,
                });
              }
            }
          >
            <h1 className="slate-h1">Heading 1</h1>
          </Dropdown.Item>
          <Dropdown.Item
            active={someNode(editor, { match: { type: DEFAULTS_HEADING.h2.type } })}
            eventKey="h2"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_HEADING.h2.type,
                });
              }
            }
          >
            <h2 className="slate-h2">Heading 2</h2>
          </Dropdown.Item>
          <Dropdown.Item
            active={someNode(editor, { match: { type: DEFAULTS_HEADING.h3.type } })}
            eventKey="h3"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_HEADING.h3.type,
                });
              }
            }
          >
            <h3 className="slate-h3">Heading 3</h3>
          </Dropdown.Item>
          <Dropdown.Item
            active={someNode(editor, { match: { type: DEFAULTS_HEADING.h4.type } })}
            eventKey="h4"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_HEADING.h4.type,
                });
              }
            }
          >
            <h4 className="slate-h4">Heading 4</h4>
          </Dropdown.Item>
          <Dropdown.Item
            active={someNode(editor, { match: { type: DEFAULTS_HEADING.h5.type } })}
            eventKey="h5"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_HEADING.h5.type,
                });
              }
            }
          >
            <h5 className="slate-h5">Heading 5</h5>
          </Dropdown.Item>
          <Dropdown.Item
            active={someNode(editor, { match: { type: DEFAULTS_HEADING.h6.type } })}
            eventKey="h6"
            onSelect={
              (eventKey, e) => {
                e.preventDefault();
                toggleNodeType(editor, {
                  activeType: DEFAULTS_HEADING.h6.type,
                });
              }
            }
          >
            <h6 className="slate-h6">Heading 6</h6>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      <MarkButton format="bold" disabled={disabled} className={styles['toolbar-button']}>
        <TypeBold />
      </MarkButton>
      <OverlayTrigger overlay={<Tooltip>Italic</Tooltip>}>
        <MarkButton format="italic" disabled={disabled} className={styles['toolbar-button']}>
          <TypeItalic />
        </MarkButton>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip>Underline</Tooltip>}>
        <MarkButton format="underline" disabled={disabled} className={styles['toolbar-button']}>
          <TypeUnderline />
        </MarkButton>
      </OverlayTrigger>
      <OverlayTrigger overlay={<Tooltip>Strikethrough</Tooltip>}>
        <MarkButton
          format="strikethrough"
          disabled={disabled}
          className={`${styles['button-group-end']} ${styles['toolbar-button']}`}
        >
          <TypeStrikethrough />
        </MarkButton>
      </OverlayTrigger>
      <ToolbarAlign
        disabled={disabled}
        type={DEFAULTS_ALIGN.align_left.type}
        icon={<BlockButton format="align-left" disabled={disabled}><TextLeft /></BlockButton>}
        className={styles['toolbar-button']}
      />
      <ToolbarAlign
        disabled={disabled}
        type={DEFAULTS_ALIGN.align_center.type}
        icon={<BlockButton format="align-center" disabled={disabled}><TextCenter /></BlockButton>}
        className={styles['toolbar-button']}
      />
      <ToolbarAlign
        disabled={disabled}
        type={DEFAULTS_ALIGN.align_right.type}
        icon={<BlockButton format="align-right" disabled={disabled}><TextRight /></BlockButton>}
        className={`${styles['button-group-end']} ${styles['toolbar-button']}`}
      />
      <ToolbarList
        disabled={disabled}
        typeList={DEFAULTS_LIST.ul.type}
        icon={<BlockButton format="bulleted-list" disabled={disabled}><ListUl /></BlockButton>}
        className={styles['toolbar-button']}
      />
      <ToolbarList
        disabled={disabled}
        typeList={DEFAULTS_LIST.ol.type}
        icon={<BlockButton format="numbered-list" disabled={disabled}><ListOl /></BlockButton>}
        className={`${styles['button-group-end']} ${styles['toolbar-button']}`}
      />
      <ToolbarLink
        options={DEFAULTS_LINK}
        icon={<BlockButton format="link" disabled={disabled}><Link45deg /></BlockButton>}
        className={styles['toolbar-button']}
      />
      <ToolbarImage
        options={DEFAULTS_IMAGE}
        icon={<BlockButton format="image" disabled={disabled}><Image /></BlockButton>}
        className={styles['toolbar-button']}
      />
      <ToolbarButton
        disabled={disabled}
        type={ELEMENT_MEDIA_EMBED}
        className={`${exportButton ? '' : styles['button-group-end']} ${styles['toolbar-button']}`}
        icon={(
          <OverlayTrigger
            disabled={disabled}
            overlay={<Tooltip>Video embed</Tooltip>}
          >
            <Button disabled={disabled} size="sm" variant="outline-secondary"><CameraVideoFill /></Button>
          </OverlayTrigger>
        )}
        onMouseDown={(event) => {
          event.preventDefault();
          // eslint-disable-next-line no-undef, no-alert
          const url = window.prompt('Enter the URL of the video (Vimeo or YouTube only):');
          if (!url) return;
          const embedUrl = videoURLtoEmbedURL(url);
          if (!embedUrl || embedUrl === null) return;
          insertVideoEmbed(editor, embedUrl);
        }}
      />
      {exportButton && (
      <ToolbarButton
        disabled={disabled}
        className={`${styles['button-group-end']} ${styles['toolbar-button']} ${styles['export-button']}`}
        icon={(
          <DropdownButton
            key="export-button-dropdown"
            id="export-button-dropdown"
            className={styles['export-button-dropdown']}
            variant="outline-secondary"
            title="Export"
            onSelect={exportDocument}
          >
            <Dropdown.Item
              eventKey="annotation-studio"
              className={styles.ideaspacesSortByDropdownItem}
            >
              Annotation Stuido
            </Dropdown.Item>
          </DropdownButton>
        )}
        onMouseDown={(event) => {
          event.preventDefault();
        }}
      />
      )}
    </div>
  );
};

export default SlateToolbar;
