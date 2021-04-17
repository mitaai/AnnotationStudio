import Link from 'next/link';
import styles from './TileBadge.module.scss';

export default function TileBadge({
  color = 'grey', text = '', marginLeft = 0, marginRight = 0, href,
}) {
  const colors = ['grey', 'blue', 'green', 'yellow'];
  const c = colors.includes(color) ? color : 'grey';
  const className = `${styles.tileBadge} ${styles[c]}`;
  const badge = (
    <span
      className={className}
      style={{
        marginLeft, marginRight,
      }}
    >
      {text}
    </span>
  );

  return href === undefined ? badge : (
    <Link href={href}>
      {badge}
    </Link>
  );
}
