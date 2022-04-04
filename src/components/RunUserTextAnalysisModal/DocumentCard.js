/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useState,
} from 'react';
import {
  FileEarmarkText, XCircleFill,
} from 'react-bootstrap-icons';
import styles from './RunUserTextAnalysisModal.module.scss';


function DocumentCard({
  onDelete = () => {}, author, title, width, height, onClick = () => {},
}) {
  const [hover, setHover] = useState();
  const [deleteHovered, setDeleteHovered] = useState();

  const onMouseOver = () => {
    setHover(true);
  };

  const onMouseOut = () => {
    setHover();
  };

  const red = '#de0202';
  const blue = '#026EFF';

  let borderColor = '#eeeeee';
  if (deleteHovered) {
    borderColor = red;
  } else if (hover) {
    borderColor = blue;
  }

  const maxTitleLength = 23;
  const maxAuthorLength = 13;

  return (
    <>
      <span
        style={{
          width,
          minWidth: width,
          height,
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          borderWidth: (deleteHovered || hover) ? 2 : 1,
          borderStyle: 'solid',
          borderColor,
          alignItems: 'center',
          marginRight: 15,
          paddingTop: 15,
          position: 'relative',
          transition: 'border-color 0.25s',
          cursor: 'pointer',
        }}
        role="button"
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onFocus={onMouseOver}
        onBlur={onMouseOut}
        onClick={deleteHovered ? () => {} : onClick}
      >
        <XCircleFill
          style={{
            position: 'absolute', top: 4, right: 6, opacity: hover ? 1 : 0, transition: 'all 0.5s',
          }}
          onMouseOver={() => setDeleteHovered(true)}
          onMouseOut={() => setDeleteHovered()}
          onClick={() => onDelete()}
          size={14}
          color={deleteHovered ? red : '#616161'}
        />
        <div style={{
          display: 'flex', backgroundColor: '#f5fbff', borderRadius: 15, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
        }}
        >
          <FileEarmarkText size={24} color="#015999" />
        </div>
        <div className={styles.documentCardTitle}>
          {title.length > maxTitleLength ? `${title.substring(0, maxTitleLength - 3)}...` : title}
        </div>
        <div style={{
          fontSize: 12, color: '#A0ADC0', textAlign: 'center',
        }}
        >
          {author.length > maxAuthorLength ? `${author.substring(0, maxAuthorLength - 3)}...` : author}
        </div>
      </span>

      <style jsx global>
        {`
      
    `}
      </style>
    </>
  );
}

export default DocumentCard;


