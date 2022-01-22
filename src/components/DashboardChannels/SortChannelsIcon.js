/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useState } from 'react';
import {
  ArrowDownUp,
  Check,
} from 'react-bootstrap-icons';
import { Popover, Overlay } from 'react-bootstrap';

import styles from './DashboardChannels.module.scss';

export default function SortChannelsIcon({
  selected,
  setSelected,
  asc,
  setAsc,
}) {
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const handleClick = (event) => {
    setShow(!show);
    setTarget(event.target);
  };

  return (
    <div ref={ref}>
      <ArrowDownUp
        className={styles.sortChannelsIcon}
        onClick={handleClick}
      />
      <Overlay
        show={show}
        target={target}
        placement="bottom"
        container={ref}
        containerPadding={20}
      >
        <Popover
          id="popover-basic"
        >
          <Popover.Content style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
                cursor: 'pointer',
              }}
              onClick={() => { setSelected(); setShow(); }}
            >
              <span style={{ flex: 1, marginRight: 5 }}>By Date Created</span>
              {selected === 'by-date-created' && <Check className={styles.dropdownCheck} size={18} />}
            </span>
            <span
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
                cursor: 'pointer',
              }}
              onClick={() => { setSelected(); setShow(); }}
            >
              <span style={{ flex: 1, marginRight: 20 }}>Alphabetically</span>
              {selected === 'alpha' && <Check className={styles.dropdownCheck} size={18} />}
            </span>
            <div
              style={{
                width: '100%', height: 1, backgroundColor: '#eeeeee', marginBottom: 8, marginTop: 6,
              }}
            />
            <span
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
                cursor: 'pointer',
              }}
              onClick={() => { setAsc(); setShow(); }}
            >
              <span style={{ flex: 1, marginRight: 38 }}>Ascending</span>
              {asc && <Check className={styles.dropdownCheck} size={18} />}
            </span>
            <span
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 3,
                cursor: 'pointer',
              }}
              onClick={() => { setAsc(); setShow(); }}
            >
              <span style={{ flex: 1 }}>Descending</span>
              {!asc && <Check className={styles.dropdownCheck} size={18} />}
            </span>
          </Popover.Content>
        </Popover>
      </Overlay>
    </div>
  );
}
