import { useState } from 'react';
import Router from 'next/router';
import {
  OverlayTrigger,
} from 'react-bootstrap';
import { XCircle } from 'react-bootstrap-icons';
import styles from './TileBadge.module.scss';


export default function TileBadge({
  onClick,
  popover,
  showPopover,
  setShowPopover,
  color = 'grey',
  text = '',
  marginLeft = 0,
  marginRight = 0,
  href,
  fontSize = 10,
  icon,
  onDelete,
}) {
  const [focused, setFocused] = useState();
  const [hoverCancel, setHoverCancel] = useState();
  const colors = ['grey', 'blue', 'green', 'yellow', 'red'];
  const c = colors.includes(color) ? color : 'grey';
  const classNames = [
    styles.tileBadge,
    styles[hoverCancel ? 'red' : c],
    focused ? styles.tileBadgeFoucsed : '',
  ].join(' ');
  const tileBadgeOnClick = href === undefined ? onClick : () => {
    Router.push(href);
  };
  const badge = tileBadgeOnClick === undefined && popover === undefined
    ? (
      <span
        className={classNames}
        onMouseOver={() => {
          if (onDelete) {
            setHoverCancel(true);
          }
        }}
        onMouseOut={() => {
          if (onDelete) {
            setHoverCancel();
          }
        }}
        onFocus={() => {
          if (onDelete) {
            setHoverCancel(true);
          }
        }}
        onBlur={() => {
          if (onDelete) {
            setHoverCancel();
          }
        }}
        onClick={onDelete}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            onDelete();
          }
        }}
        style={{
          marginLeft, marginRight, fontSize, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
        <span className={styles.tileBadgeText}>{text}</span>
        {onDelete && (
        <XCircle
          onClick={onDelete}
          className={styles.cancelIcon}
          size={fontSize + 2}
        />
        )}
      </span>
    )
    : (
      <span
        onClick={tileBadgeOnClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused()}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.code === 'Space' || e.code === 'Enter') {
            if (setShowPopover !== undefined) {
              setShowPopover(!showPopover);
            } else if (tileBadgeOnClick !== undefined) {
              tileBadgeOnClick();
            }
          }
        }}
        className={classNames}
        style={{
          marginLeft, marginRight, fontSize,
        }}
      >
        <span>{text}</span>
      </span>
    );
  return popover !== undefined ? (
    <OverlayTrigger
      onToggle={() => setShowPopover(!showPopover)}
      onHide={() => setShowPopover()}
      rootClose
      show={showPopover}
      trigger="click"
      placement="bottom"
      overlay={popover}
    >
      {badge}
    </OverlayTrigger>
  ) : badge;
}
