import { useState, useEffect } from 'react';
import $ from 'jquery';
import {
  Button, Dropdown, OverlayTrigger, Tooltip, DropdownButton,
} from 'react-bootstrap';
import {
  CameraVideoFill,
  Check,
  GearFill,
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
  X,
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
import SourceTextAnalysisButton from '../SourceTextAnalysisButton';
import DocumentZoomSlider from '../DocumentZoomSlider';
import { getDocumentBySlug } from '../../utils/docUtil';

const SlateToolbar = ({
  style = {},
  disabled,
  exportButton,
  runAnalysisButton,
  analysisMode,
  setAnalysisMode,
  session,
  convertAnnotationTilesToImages = () => {},
  exportDocument = () => {},
  setSourceTextAnalysisResults = () => {},
  sourceTextMode,
  setSourceTextMode,
  toolbarPos,
  stContainer,
  showSourceTextDropdown,
  setShowSourceTextDropdown,
  documentZoom,
  setDocumentZoom,
  selectedDocuments = {},
  setSelectedDocuments,
  selectedSourceDocumentId,
  orderOfSelectedDocuments = [],
  setOrderOfSelectedDocuments,
  loadedDocuments,
  updateLoadedDocuments,
}) => {
  const [showSourceTextAnalysisPopover, setShowSourceTextAnalysisPopover] = useState();
  const [targetSourceTextAnalysisPopover, setTargetSourceTextAnalysisPopover] = useState();
  const [hoverExit, setHoverExit] = useState();

  const [addedDetectedDocuments, setAddedDetectedDocuments] = useState();

  const exportDocumentKey = 'annotation-studio';
  const runAnalysisKey = 'run-analysis';
  const onSelect = (key) => {
    if (key === exportDocumentKey) {
      exportDocument(key);
    } else if (key === runAnalysisKey) {
      setAnalysisMode(true);
    }
  };
  const editor = useSlate();

  const documentWidth = 750;

  const cancelId = 'cancel-st-view';

  const classNames = [
    styles.sortByDropdown,
    showSourceTextDropdown ? styles.sortByDropdownSelected : '',
    hoverExit ? styles.dangerDropdown : '',
  ].join(' ');

  const dropdownItems = orderOfSelectedDocuments.map((id) => (
    <Dropdown.Item style={{ width: 550, display: 'flex', flexDirection: 'row' }} href={`#sd-${id}`}>
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1, width: '100%',
      }}
      >
        <div
          style={{
            fontSize: 16, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {selectedDocuments[id].title}
        </div>
        <div
          style={{
            fontSize: 12, color: '#757575', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {selectedDocuments[id].author}
        </div>
      </div>
      {id === selectedSourceDocumentId && (
      <div
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 6,
        }}
      >
        <Check size={26} color="#026EFF" />
      </div>
      )}
    </Dropdown.Item>
  ));

  const stContainerStyling = stContainer
    ? { left: stContainer.left, width: stContainer.width, opacity: stContainer.opacity }
    : {};

  console.log('stContainerStyling', stContainerStyling);

  const openDocument = async (slug) => {
    getDocumentBySlug(slug)
      .then((res) => {
        console.log('res', res);
        updateLoadedDocuments({ document: res, selected: true });
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  useEffect(() => {
    setShowSourceTextAnalysisPopover(analysisMode);
    if (analysisMode) {
      setTargetSourceTextAnalysisPopover($('#source-text-analysis-button').get(0));
    }
  }, [analysisMode]);

  return (
    <>
      <div
        className={`${styles['slate-toolbar']} ${analysisMode ? styles['analysis-mode'] : ''}`}
        data-testid="slate-toolbar"
        style={style}
      >
        <div style={{
          position: 'absolute',
          zIndex: 4,
          opacity: analysisMode ? 1 : 0,
          transition: 'opacity 0.5s',
        }}
        >
          <SourceTextAnalysisButton
            exit={() => {
              setAnalysisMode();
              // reseting values when analysis mode is turned off
              setAddedDetectedDocuments();
              setOrderOfSelectedDocuments([]);
              setSelectedDocuments({});
            }}
            session={session}
            convertAnnotationTilesToImages={convertAnnotationTilesToImages}
            setSourceTextAnalysisResults={(obj) => setSourceTextAnalysisResults(obj)}
            show={showSourceTextAnalysisPopover}
            setShow={setShowSourceTextAnalysisPopover}
            target={targetSourceTextAnalysisPopover}
            setSourceTextMode={setSourceTextMode}
            selectedDocuments={selectedDocuments}
            setSelectedDocuments={setSelectedDocuments}
            orderOfSelectedDocuments={orderOfSelectedDocuments}
            setOrderOfSelectedDocuments={setOrderOfSelectedDocuments}
            addedDetectedDocuments={addedDetectedDocuments}
            setAddedDetectedDocuments={setAddedDetectedDocuments}
            openDocument={openDocument}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 4,
            opacity: sourceTextMode ? 1 : 0,
            backgroundColor: '#D4D5D7',
            width: 1,
            height: 40,
            left: sourceTextMode ? '50%' : '100%',
            transition: 'all 0.5s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            zIndex: 4,
            transition: 'all 0.5s',
            ...stContainerStyling,
          }}
        >
          <DropdownButton
            id="source-text-dropdown"
            className={classNames}
            variant={hoverExit ? 'danger' : 'light'}
            size="sm"
            title={(
              <span style={{ marginRight: 4 }}>
                <X
                  id={cancelId}
                  style={{ position: 'relative', top: -1, marginRight: 4 }}
                  size={16}
                  onMouseEnter={() => setHoverExit(true)}
                  onMouseLeave={() => setHoverExit()}
                  onClick={() => setSourceTextMode()}
                />
                <span>Select Text</span>
              </span>
          )}
            onClick={() => {
              if (!hoverExit) {
                setShowSourceTextDropdown(!showSourceTextDropdown);
              }
            }}
            show={showSourceTextDropdown}
            onToggle={(isOpen, e, { source }) => {
              if (source === 'rootClose') {
                setShowSourceTextDropdown();
              }
            }}
            onSelect={(e) => {
              // the variable e is of the form '#sd-${id}', where '#sd-' stands for
              // 'source document'. We are extracting the '${id}' part of the string
              const id = e.split('-')[1];
              if (!loadedDocuments[id]) {
                openDocument(selectedDocuments[id].slug);
              }
            }}
          >
            {dropdownItems}
          </DropdownButton>
          <div style={{ position: 'absolute', right: 9, top: 0 }}>
            <DocumentZoomSlider
              stateful
              documentZoom={documentZoom}
              setDocumentZoom={setDocumentZoom}
              backgroundColor="white"
              min={100}
            />
          </div>
        </div>
        <div
          style={{
            width: documentWidth, display: 'flex', flexDirection: 'row', justifyContent: 'center', position: 'relative', left: `max(${toolbarPos}, 130px)`, transition: 'left 0.5s',
          }}
        >
          <Dropdown disabled={disabled}>
            <OverlayTrigger overlay={<Tooltip>Styles</Tooltip>}>
              <Dropdown.Toggle
                size="sm"
                variant="outline-secondary"
                className={styles['button-group-end']}
                style={{ paddingTop: 5, paddingBottom: 5 }}
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
            className={`${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
          />
          <ToolbarAlign
            disabled={disabled}
            type={DEFAULTS_ALIGN.align_center.type}
            icon={<BlockButton format="align-center" disabled={disabled}><TextCenter /></BlockButton>}
            className={`${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
          />
          <ToolbarAlign
            disabled={disabled}
            type={DEFAULTS_ALIGN.align_right.type}
            icon={<BlockButton format="align-right" disabled={disabled}><TextRight /></BlockButton>}
            className={`${styles['button-group-end']} ${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
          />
          <ToolbarList
            disabled={disabled}
            typeList={DEFAULTS_LIST.ul.type}
            icon={<BlockButton format="bulleted-list" disabled={disabled}><ListUl /></BlockButton>}
            className={`${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
          />
          <ToolbarList
            disabled={disabled}
            typeList={DEFAULTS_LIST.ol.type}
            icon={<BlockButton format="numbered-list" disabled={disabled}><ListOl /></BlockButton>}
            className={`${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
          />
          <ToolbarLink
            options={DEFAULTS_LINK}
            icon={<BlockButton format="link" disabled={disabled}><Link45deg /></BlockButton>}
            className={`${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
          />
          <ToolbarImage
            options={DEFAULTS_IMAGE}
            icon={<BlockButton format="image" disabled={disabled}><Image /></BlockButton>}
            className={`${styles['toolbar-button']} ${styles['toolbar-button-extra-padding']}`}
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
          {exportButton && runAnalysisButton && (
          <ToolbarButton
            disabled={disabled}
            className={`${styles['button-group-end']} ${styles['toolbar-button']} ${styles['export-button']}`}
            icon={(
              <DropdownButton
                key="export-button-dropdown"
                id="export-button-dropdown"
                className={styles['export-button-dropdown']}
                variant="outline-secondary"
                title={<GearFill size={14} />}
                onSelect={onSelect}
              >
                <Dropdown.Item
                  eventKey={exportDocumentKey}
                  className={styles.ideaspacesSortByDropdownItem}
                >
                  Export to Annotation Stuido
                </Dropdown.Item>
                <Dropdown.Item
                  eventKey={runAnalysisKey}
                  className={styles.ideaspacesSortByDropdownItem}
                >
                  Run Text Analysis
                </Dropdown.Item>
              </DropdownButton>
        )}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
          />
          )}
        </div>
      </div>
      <style jsx global>
        {`

          [aria-labelledby="source-text-dropdown"] {
            opacity: ${(hoverExit || !sourceTextMode) ? '0' : '1'};
          }
          
          `}
      </style>
    </>
  );
};

export default SlateToolbar;
