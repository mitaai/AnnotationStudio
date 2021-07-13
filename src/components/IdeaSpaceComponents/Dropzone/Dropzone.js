import React, { useState } from 'react';
import styles from './Dropzone.module.scss';
import { DeepCopyObj, RID } from '../../../utils/docUIUtils';

const Dropzone = ({
  document,
  setDocument = () => {},
  getDroppedAnnotationsData = () => {},
  posArray,
  hydrateOutlineData = () => {},
  setRemoveDropzones = () => {},
}) => {
  const [dragEnter, setDragEnter] = useState();
  return (
    <div
      className={styles.dropzoneContainer}
    >
      <div
        className={`${styles.dropzone} ${dragEnter ? styles.dropzoneDragEnter : ''}`}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragEnter(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragEnter(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragEnter();
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (posArray === undefined) { return; }
          const newSlateValue = DeepCopyObj(document);
          const container = posArray.slice(0, -1).reduce((o, k) => o[k], newSlateValue);
          const annos = getDroppedAnnotationsData();
          if (annos) {
            const formattedAnnos = annos.map((a) => ({
              type: 'annotation',
              annotationData: { oid: RID(), ...a },
              children: [{ text: '' }],
            }));
            container.splice(posArray.slice(-1)[0], 0, ...formattedAnnos);
          }
          setDocument(hydrateOutlineData(newSlateValue));
          setRemoveDropzones(true);
          setDragEnter();
        }}
      />
    </div>
  );
};

export default Dropzone;
