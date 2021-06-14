import { useState } from 'react';
import moment from 'moment';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';
import styles from './DashboardChannels.module.scss';

export default function OutlineTile({
  name = '',
  activityDate,
  onClick = () => {},
  onDelete = () => {},
}) {
  const [hovered, setHovered] = useState();
  const [focused, setFoucsed] = useState();
  const [deleteHovered, setDeleteHovered] = useState();
  const classNames = [
    styles.tile,
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
    deleteHovered ? styles.tileDeleteHovered : '',
  ].join(' ');

  return (
    <div
      className={classNames}
      style={{ flexDirection: 'row', paddingTop: 14, paddingBottom: 14 }}
      onClick={deleteHovered ? onDelete : onClick}
      onMouseMove={() => {
        if (!hovered) {
          setHovered(true);
        }
      }}
      onMouseOver={() => setHovered(true)}
      onMouseOut={() => setHovered()}
      onFocus={() => { setHovered(true); setFoucsed(true); }}
      onBlur={() => { setHovered(); setFoucsed(); }}
      onKeyDown={(e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <XCircleFill
        className={styles.deleteBtn}
        style={{ top: 3, right: 3 }}
        onMouseOver={() => setDeleteHovered(true)}
        onMouseOut={() => setDeleteHovered()}
        size={14}
      />
      <div
        className={styles.annotatedText}
      >
        {name}
      </div>

      <div className={styles.memberText} style={{ justifyContent: 'flex-end' }}>
        <OverlayTrigger
          key="annotation-activity-date-tooltip"
          placement="bottom"
          onExited={() => setHovered()}
          overlay={(
            <Popover id="popover-basic">
              <Popover.Content style={{ color: '#636363' }}>{moment(activityDate).format('LLLL')}</Popover.Content>
            </Popover>
            )}
        >
          <span>{moment(activityDate).fromNow()}</span>
        </OverlayTrigger>
      </div>
    </div>
  );
}
