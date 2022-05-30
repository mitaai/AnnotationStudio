/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
// import styles from './BadgeButton.module.scss';

export default function BadgeButton({
  text = 'undefined',
  color = 'black',
  backgroundColor = 'white',
  borderColor = 'white',
  paddingLeft = 9,
  paddingRight = 9,
  paddingTop = 3,
  paddingBottom = 3,
  marginTop = 0,
  marginLeft = 0,
  marginBottom = 0,
  marginRight = 0,
}) {
  return (
    <span
      style={{
        cursor: 'pointer',
        textAlign: 'center',
        color,
        backgroundColor,
        borderRadius: 4,
        border: `1px solid ${borderColor}`,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        marginTop,
        marginLeft,
        marginBottom,
        marginRight,
      }}
      onClick={() => {}}
    >
      {text}
    </span>
  );
}

/*
<BadgeButton
    text="Manage"
    color="#355CBC"
    backgroundColor="#F1F5FF"
    borderColor="#D3DEFC"
    marginRight={4}
/>
<BadgeButton
    text="Delete"
    color="#F80000"
    backgroundColor="#FFF1F1"
    borderColor="#FCD3D3"
    marginRight={4}
/>
<BadgeButton
    text="Archive"
    color="#B468F4"
    backgroundColor="#FAF5FF"
    borderColor="#EDDDFD"
    marginRight={4}
/>
<BadgeButton
    text="Leave"
    color="#FF7C34"
    backgroundColor="#FFF7F1"
    borderColor="#FCE1D3"
    marginRight={4}
/>
*/
