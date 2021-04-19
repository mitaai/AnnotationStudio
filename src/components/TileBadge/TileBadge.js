import Router from 'next/router';
import styles from './TileBadge.module.scss';

export default function TileBadge({
  onClick = () => {}, color = 'grey', text = '', marginLeft = 0, marginRight = 0, href,
}) {
  const colors = ['grey', 'blue', 'green', 'yellow'];
  const c = colors.includes(color) ? color : 'grey';
  const className = `${styles.tileBadge} ${styles[c]}`;

  return (
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
}
