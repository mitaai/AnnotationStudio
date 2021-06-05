import {
  Accordion,
} from 'react-bootstrap';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import styles from './ISGroupHeader.module.scss';

import TileBadge from '../../TileBadge';


export default function ISGroupHeader({
  name = '', numberOfAnnotations = 0, size = 16, children, active, toggle,
}) {
  const numberOfAnnotationsText = `${numberOfAnnotations} annotation${numberOfAnnotations === 1 ? '' : 's'}`;
  return (
    <div style={{ marginBottom: 15 }}>
      <Accordion activeKey={active ? 'name' : ''}>
        <div>
          <div
            className={styles.container}
            onClick={toggle}
            role="button"
            onKeyDown={() => {}}
            tabIndex={-1}
          >
            {active ? <ChevronUp size={size} color="#424242" /> : <ChevronDown size={size} color="#424242" />}
            <div className={styles.name}>
              {name}
            </div>
            <TileBadge color="yellow" text={numberOfAnnotationsText} />
          </div>
          <div className={styles.pointer} style={active ? {} : { opacity: 0, marginBottom: -20 }} />
        </div>
        <Accordion.Collapse eventKey="name" className={styles.tileContainer}>
          <>
            {children}
          </>
        </Accordion.Collapse>
      </Accordion>
    </div>

  );
}
