/* eslint-disable react/jsx-props-no-spreading */
import React, {
  useState, useMemo, useEffect,
} from 'react';
import {
  Spinner,
} from 'react-bootstrap';
import { createEditor } from 'slate';
import {
  Slate, withReact,
} from 'slate-react';
import {
  DEFAULTS_LIST,
  DEFAULTS_PARAGRAPH,
  DEFAULTS_TABLE,
  EditablePlugins,
  pipe,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withList,
  withMarks,
  withTable,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { plugins, withDivs } from '../../../utils/slateUtil';
import SlateToolbar from '../../SlateToolbar';
import styles from './ISOutline.module.scss';

const ISOutline = ({
  document,
  setDocument,
}) => {
  const [slateLoading, setSlateLoading] = useState(false);
  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withCodeBlock(),
    withInlineVoid({ plugins }),
    withList(DEFAULTS_LIST),
    withMarks(),
    withTable(DEFAULTS_TABLE),
    withDeserializeHTML({ plugins }),
    withDivs(),
  ];
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const slateInitialValue = [
    {
      children: [{ text: '' }],
      type: DEFAULTS_PARAGRAPH.p.type,
    },
  ];

  const [slateValue, setSlateValue] = useState(document || slateInitialValue);

  useEffect(() => {
    setSlateLoading(false);
    setDocument(slateValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slateValue]);


  return (
    <>
      <Slate
        editor={editor}
        value={slateValue}
        disabled={false}
        onChange={(value) => {
          setSlateLoading(false);
          setSlateValue(value);
        }}
      >
        <SlateToolbar
          id="hello"
          key="goodbye"
          disabled={false}
        />
        {slateLoading && (
        <div className={styles['slate-loader']}>
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          <div className="text-center">
            <h4 className="text-muted">
              <em>Please wait, processing pasted content.</em>
            </h4>
            <small className="text-muted">
              The page may become unresponsive. Please do not
              close or navigate away from the page.
            </small>
          </div>
        </div>
        )}
        <EditablePlugins
          plugins={plugins}
          disabled={false}
          onKeyDown={[(e) => {
            const isPasteCapture = (e.ctrlKey || e.metaKey)
          && e.keyCode === 86;
            if (isPasteCapture) {
              setSlateLoading(true);
            }
          }]}
          placeholder="Paste or type here"
          id="outline-container"
          className={styles['slate-editor']}
        />
      </Slate>
      <style jsx global>
        {`
            [data-testid='slate-toolbar'] {
              border-radius: 0px;
            }

            #outline-container {
              border-radius: 0px;
              height: calc(100vh - 299px);
              resize: none;
              outline: none !important;
              box-shadow: none !important;
              border: 1px solid #ced4da !important;
            }
        `}
      </style>
    </>
  );
};

export default ISOutline;
