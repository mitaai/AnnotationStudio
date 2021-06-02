import { useState } from 'react';
import moment from 'moment';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import styles from './DashboardChannels.module.scss';

export default function OutlineTile({
  name = '', activityDate, onClick = () => {},
}) {
  const [hovered, setHovered] = useState();
  const [focused, setFoucsed] = useState();
  const classNames = [
    styles.tile,
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
  ].join(' ');

  return (
    <div
      className={classNames}
      style={{ flexDirection: 'row', paddingTop: 10 }}
      onClick={onClick}
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
