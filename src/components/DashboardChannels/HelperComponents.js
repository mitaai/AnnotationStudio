import React from 'react';
import {
  ThreeDotsVertical,
} from 'react-bootstrap-icons';
import {
  Spinner,
} from 'react-bootstrap';

import styles from './DashboardChannels.module.scss';

function ListLoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', marginTop: 10 }}>
      <Spinner animation="border" />
    </div>
  );
}

function EmptyListMessage({ text = '0 items found' }) {
  return (
    <div style={{
      color: '#424242', fontSize: 14, textAlign: 'center', marginTop: 10,
    }}
    >
      {text}
    </div>
  );
}

function TilePointer({ selected }) {
  return (
    <>
      <span className={`${styles.tilePointerBackground} ${selected ? styles.tilePointerSelectedBackground : ''}`} />
      <span className={`${styles.tilePointer} ${selected ? styles.tilePointerSelected : ''}`} />
    </>
  );
}

const ThreeDotDropdown = React.forwardRef(({ onClick }, ref) => (
  <ThreeDotsVertical
    className={styles.moreTileOptions}
    size={20}
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
  />
));

export {
  ListLoadingSpinner, EmptyListMessage, TilePointer, ThreeDotDropdown,
};
