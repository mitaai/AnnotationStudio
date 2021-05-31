import { useState } from 'react';
import Router from 'next/router';
import {
  OverlayTrigger,
} from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';
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
        style={{
          marginLeft, marginRight, fontSize, cursor: 'default', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {icon}
        {text}
        {onDelete && (
        <XCircleFill
          onMouseOver={() => setHoverCancel(true)}
          onMouseOut={() => setHoverCancel()}
          onClick={onDelete}
          className={styles.cancelIcon}
          size={fontSize + 4}
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
        {text}
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
