/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useState } from 'react';
import {
  ArrowDownUp,
  Check,
} from 'react-bootstrap-icons';
import {
  Popover, Overlay,
} from 'react-bootstrap';

import styles from './DashboardChannels.module.scss';

export default function SortChannelsIcon({
  id = '',
  selected,
  setSelected,
  asc,
  setAsc,
  onMouseEnter = () => {},
  state,
  show,
  setShow = () => {},
}) {
  const [target, setTarget] = useState(null);
  const ref = useRef(null);

  const [popoverEntered, setPopoverEntered] = useState();

  const svgIconId = `sort-${id}-icon`;

  const handleClick = (event) => {
    if (!show) {
      setShow(true);
      setTarget(event.target);
    } else if (event.target.id === svgIconId) {
      setShow();
      setTarget(null);
    }
  };

  const hidePopover = () => {
    setShow();
    setTarget(null);
  };

  const handleMouseLeave = (ev) => {
    if (ev.target.className === 'arrow') { return; }
    hidePopover();
  };

  return (
    <>
      <div
        ref={ref}
        className={styles.optionContainer}
        style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...state.arrowDownUp,
        }}
        onClick={handleClick}
        onKeyDown={() => {}}
        onMouseEnter={show ? () => {} : onMouseEnter}
        tabIndex={-1}
        role="button"
      >
        <ArrowDownUp
          id={svgIconId}
          size={14}
          style={{
            transition: 'all 0.25s',
          }}
        />
        <Overlay
          show={show}
          target={target}
          placement="bottom"
          container={ref}
          containerPadding={20}
        >
          <Popover
            id={`popover-sort-header-content-${id}`}
            style={{ width: 250 }}
            onMouseEnter={() => setPopoverEntered(true)}
            onMouseLeave={popoverEntered ? handleMouseLeave : () => {}}
          >
            <Popover.Content
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 3,
                  cursor: 'pointer',
                }}
                onClick={() => { hidePopover(); setSelected('by-date-created'); }}
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
                onClick={() => { hidePopover(); setSelected('alpha'); }}
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
                onClick={() => { hidePopover(); setAsc(true); }}
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
                onClick={() => { hidePopover(); setAsc(); }}
              >
                <span style={{ flex: 1 }}>Descending</span>
                {!asc && <Check className={styles.dropdownCheck} size={18} />}
              </span>
            </Popover.Content>
          </Popover>
        </Overlay>
      </div>
      <style jsx global>
        {`
        #popover-sort-header-content-${id} .arrow {
          left: -6px !important;
        }
      `}
      </style>
    </>
  );
}
