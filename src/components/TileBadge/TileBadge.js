import styles from './TileBadge.module.scss';

export default function TileBadge({
  color = 'grey', text = '', marginLeft = 0, marginRight = 0,
}) {
  const colors = ['grey', 'blue', 'green', 'yellow'];
  const c = colors.includes(color) ? color : 'grey';
  return (
    <div
      className={`${styles.tileBadge} ${styles[c]}`}
      style={{
        marginLeft, marginRight,
      }}
    >
      {text}
    </div>
  );
}
