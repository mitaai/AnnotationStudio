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
  exportDocument,
  document,
  setDocument,
  getDroppedAnnotationsData,
  hydrateOutlineData,
  annotationsBeingDragged,
  setAnnotationsBeingDragged,
}) => {
  const [slateLoading, setSlateLoading] = useState(false);
  const [removeDropzones, setRemoveDropzones] = useState(false);
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

  const addDropzonesToSlateValue = (arr, parentType, currentPosArray = []) => {
    const newArr = [];
    for (let i = 0; i < arr.length; i += 1) {
      const {
        type,
        children,
        text,
        dropzoneType,
      } = arr[i];
      if (dropzoneType === undefined) {
        if (text !== undefined) {
          newArr.push(arr[i]);
        } else if (children) {
          newArr.push({ ...arr[i], children: addDropzonesToSlateValue(children, type, currentPosArray.concat([i, 'children'])) });
          if (parentType === undefined || (!['li'].includes(parentType) && type !== 'p')) {
            newArr.push({
              type: 'dropzone',
              dropzoneType: type,
              children: [{ text: '' }],
              props: {
                posArray: currentPosArray.concat([i + 1]),
                getDroppedAnnotationsData,
                hydrateOutlineData,
                document,
                setDocument,
                setRemoveDropzones,
              },
            });
          }
        }
      }
    }
    return newArr;
  };

  const removeDropzonesFromSlateValue = (arr) => {
    const newArr = [];
    for (let i = 0; i < arr.length; i += 1) {
      const {
        children,
        text,
        dropzoneType,
      } = arr[i];
      if (dropzoneType === undefined) {
        if (text !== undefined) {
          newArr.push(arr[i]);
        } else {
          newArr.push({ ...arr[i], children: children && removeDropzonesFromSlateValue(children) });
        }
      }
    }

    return newArr;
  };


  useEffect(() => {
    setSlateLoading(false);
    if (removeDropzones) {
      setAnnotationsBeingDragged();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, removeDropzones]);

  return (
    <>
      <Slate
        editor={editor}
        value={annotationsBeingDragged ? addDropzonesToSlateValue(document) : document}
        disabled={false}
        onChange={(value) => {
          setSlateLoading(false);
          setDocument(removeDropzonesFromSlateValue(value));
        }}
      >
        <SlateToolbar
          id="hello"
          key="goodbye"
          disabled={false}
          exportButton
          exportDocument={exportDocument}
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
              height: calc(100vh - 303px);
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
