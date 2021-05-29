import React from 'react';

import styles from './ArrowButton.module.scss';


function Arrow({ direction = 'right', left = 0 }) {
  return (
    <div style={{ position: 'relative', left, transform: direction === 'right' ? '' : 'rotate(180deg)' }}>
      <div className={styles.topArrow} />
      <div className={styles.bottomArrow} />
    </div>
  );
}

export default function ArrowButton({
  text = '', direction = 'right', color = 'blue', marginLeft = 0,
}) {
  const leftArrows = [
    <Arrow direction={direction} color={color} left={-22} />,
    <Arrow direction={direction} color={color} left={-6} />,
    <Arrow direction={direction} color={color} left={10} />,
  ];
  const rightArrows = [
    <Arrow direction={direction} color={color} left={-10} />,
    <Arrow direction={direction} color={color} left={6} />,
    <Arrow direction={direction} color={color} left={22} />,
  ];
  return (
    <div
      onClick={() => {}}
      role="button"
      onKeyDown={() => {}}
      tabIndex={-1}
      className={styles.container}
      style={{ marginLeft }}
    >
      {direction === 'left' && leftArrows}
      <div className={styles.textContainer}>{text}</div>
      {direction === 'right' && rightArrows}
    </div>
  );
}
