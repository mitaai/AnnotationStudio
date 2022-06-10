/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import Link from 'next/link';
import styles from './NewPlusButton.module.scss';

const NewPlusButton = ({
  onClick, href,
}) => {
  const content = (
    <div
      className={styles.newPlusButton}
      onClick={onClick || (() => {})}
      onFocus={() => {}}
      onBlur={() => {}}
      role="button"
    >
      <span className={styles.new}><span>New</span></span>
      <span className={styles.plus}>+</span>
    </div>
  );

  return !onClick && href ? <Link href={href}>{content}</Link> : content;
};

export default NewPlusButton;

