/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useState,
} from 'react';
import {
  FileEarmarkPlus,
} from 'react-bootstrap-icons';


function AddDocumentCard({
  width, height, onClick = () => {},
}) {
  const [hover, setHover] = useState();


  const onMouseOver = () => {
    setHover(true);
  };

  const onMouseOut = () => {
    setHover();
  };

  const blue = '#026EFF';
  const borderColor = hover ? blue : '#eeeeee';
  const backgroundColor = hover ? '#f5fbff' : '#f5f5f5';
  const foregroundColor = hover ? '#015999' : '#757575';

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
          borderWidth: hover ? 2 : 1,
          borderStyle: 'solid',
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 15,
          position: 'relative',
          transition: 'border-color 0.25s',
          cursor: 'pointer',
        }}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
        onFocus={onMouseOver}
        onBlur={onMouseOut}
        onClick={onClick}
      >
        <div style={{
          display: 'flex', backgroundColor, borderRadius: 15, width: 50, height: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
        }}
        >
          <FileEarmarkPlus size={24} color={foregroundColor} />
        </div>
        <div style={{ fontSize: 10, textAlign: 'center', color: foregroundColor }}>Add Document</div>
      </span>

      <style jsx global>
        {`
    
        
      `}
      </style>
    </>
  );
}

export default AddDocumentCard;
