import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import styles from './ISGroupHeader.module.scss';

import TileBadge from '../../TileBadge';

export default function ISGroupHeader({
  name = '', collapsed, toggle = () => {}, numberOfAnnotations = 0, size = 16,
}) {
  const numberOfAnnotationsText = `${numberOfAnnotations} annotation${numberOfAnnotations === 1 ? '' : 's'}`;
  return (
    <div>
      <div className={styles.container}>
        <div
          onClick={() => toggle(!collapsed)}
          role="button"
          onKeyDown={() => {}}
          tabIndex={-1}
        >
          {collapsed ? <ChevronDown size={size} color="#424242" /> : <ChevronUp size={size} color="#424242" />}
        </div>
        <div className={styles.name}>
          {name}
        </div>
        <TileBadge color="yellow" text={numberOfAnnotationsText} />
      </div>
      <div className={styles.pointer} />
    </div>
  );
}
