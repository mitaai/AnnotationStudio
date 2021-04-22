import { useState } from 'react';
import moment from 'moment';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import TileBadge from '../TileBadge';
import styles from './DashboardChannels.module.scss';

export default function AnnotationTile({
  text = '', annotation = '', author = '', activityDate, tags, maxNumberOfAnnotationTags = 3, onClick,
}) {
  const [hovered, setHovered] = useState();
  const [focused, setFoucsed] = useState();
  const classNames = [
    styles.tile,
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
  ].join(' ');

  let tileBadges = [];
  if (tags.length > maxNumberOfAnnotationTags) {
    tileBadges = [
      <TileBadge key="tag1" color="grey" text={tags[0]} />,
      <TileBadge key="tag2" color="grey" text={tags[1]} marginLeft={5} />,
      <TileBadge key="moreTags" color="grey" text={`+${tags.length - 2} more`} marginLeft={5} />,
    ];
  } else {
    tileBadges = tags.map((t, i) => <TileBadge key={t} color="grey" text={t} marginLeft={i > 0 ? 5 : 0} />);
  }
  return (
    <div
      className={classNames}
      onClick={onClick}
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
      <div className={styles.annotatedText}>
        {`"${text}"`}
      </div>
      <div className={styles.annotation}>
        {annotation}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div className={styles.memberText}>
          <span style={{ fontWeight: 'bold' }}>{author}</span>
          <span style={{
            width: 3, height: 3, borderRadius: 1.5, background: '#838383', marginLeft: 10, marginRight: 10,
          }}
          />
          <OverlayTrigger
            key="document-activity-date-tooltip"
            placement="bottom"
            overlay={(
              <Popover id="popover-basic">
                <Popover.Content style={{ color: '#636363' }}>{moment(activityDate).format('LLLL')}</Popover.Content>
              </Popover>
            )}
          >
            <span>{moment(activityDate).fromNow()}</span>
          </OverlayTrigger>
        </div>
        {tileBadges}
      </div>
    </div>
  );
}
