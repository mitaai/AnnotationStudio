import Router from 'next/router';
import {
  OverlayTrigger,
} from 'react-bootstrap';
import styles from './TileBadge.module.scss';

export default function TileBadge({
  onClick = () => {},
  popover,
  showPopover,
  setShowPopover,
  color = 'grey',
  text = '',
  marginLeft = 0,
  marginRight = 0,
  href,
}) {
  const colors = ['grey', 'blue', 'green', 'yellow'];
  const c = colors.includes(color) ? color : 'grey';
  const className = `${styles.tileBadge} ${styles[c]}`;
  const badge = (
    <span
      onClick={href === undefined ? onClick : () => {
        Router.push(href);
      }}
      role="link"
      tabIndex={0}
      onKeyDown={() => {}}
      className={className}
      style={{
        marginLeft, marginRight,
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
