import { useState } from 'react';
import moment from 'moment';
import { OverlayTrigger, Popover, ProgressBar } from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';
import TileBadge from '../TileBadge';
import styles from './DashboardChannels.module.scss';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import AnnotationShareableLinkIcon from '../AnnotationShareableLinkIcon';

export default function AnnotationTile({
  id,
  text = '',
  annotation = '',
  author = '',
  activityDate,
  draggable,
  tags,
  maxNumberOfAnnotationTags = 3,
  onClick = () => {},
  onDelete,
  openInAnnotationStudio,
  shareableLink,
  setAlerts = () => {},
  setAnnotationsBeingDragged = () => {},
}) {
  const [deleting, setDeleting] = useState();
  const [hovered, setHovered] = useState();
  const [focused, setFoucsed] = useState();
  const [deleteHovered, setDeleteHovered] = useState();
  const [openInASHovered, setOpenInASHovered] = useState();
  const classNames = [
    styles.tile,
    hovered ? styles.tileHovered : '',
    focused ? styles.tileFocused : '',
    deleteHovered ? styles.tileDeleteHovered : '',
    openInASHovered ? styles.tileOpenInASHovered : '',
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

  const annotationShareableLinkIconClicked = (ev) => ev.target.closest('.annotation-shareable-link-icon') !== null;

  return (
    <div
      id={id}
      style={{ userSelect: 'none' }}
      className={classNames}
      contentEditable={false}
      onClick={(ev) => {
        if (annotationShareableLinkIconClicked(ev)) { return; }

        if (deleteHovered) {
          onDelete();
          setDeleting(true);
        } else if (openInASHovered) {
          openInAnnotationStudio();
        } else {
          onClick();
        }
      }}
      onMouseMove={() => {
        if (!hovered) {
          setHovered(true);
        }
      }}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered()}
      onFocus={() => { setHovered(true); setFoucsed(true); }}
      onBlur={() => { setHovered(); setFoucsed(); }}
      onKeyDown={(e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      draggable={draggable}
      onDragStart={() => setAnnotationsBeingDragged([id])}
      onDragEnd={(e) => {
        if (e.dataTransfer.dropEffect !== 'copy') {
          setAnnotationsBeingDragged();
        }
      }}
    >
      {hovered && shareableLink && (
        <AnnotationShareableLinkIcon
          onExited={() => {
            if (hovered) {
              // this makes sure that if the user exits the overlay trigger and also leaves the
              // annotation tile that we set the hovered state to false
              setHovered();
            }
          }}
          setAlerts={setAlerts}
          link={shareableLink}
          top={4}
          right={4}
          paddingTop={0}
          paddingBottom={0}
          borderRadius={5}
          border="1px solid #DCDCDC"
        />
      )}
      {openInAnnotationStudio && (
      <span
        className={styles.openInAnnotationStudioBtn}
        style={{ right: onDelete ? 23 : 5 }}
        onMouseOver={() => setOpenInASHovered(true)}
        onMouseOut={() => setOpenInASHovered()}
        onFocus={() => {}}
        onBlur={() => {}}
      >
        Open in Annotation Studio
      </span>
      )}
      {onDelete && (
      <XCircleFill
        className={styles.deleteBtn}
        onMouseOver={() => setDeleteHovered(true)}
        onMouseOut={() => setDeleteHovered()}
        size={14}
      />
      )}
      <div className={styles.annotatedText}>
        {`"${text}"`}
      </div>
      <div className={styles.annotation}>
        {annotation}
      </div>
      { deleting
        ? <ProgressBar animated now={100} variant="danger" label="deleting" />
        : (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
          }}
          >
            <div className={styles.memberText}>
              <span style={{ fontWeight: 'bold' }}>{FirstNameLastInitial(author)}</span>
              <span style={{
                width: 3, height: 3, borderRadius: 1.5, background: '#838383', marginLeft: 10, marginRight: 10,
              }}
              />
              <OverlayTrigger
                key="annotation-activity-date-tooltip"
                placement="bottom"
                onExited={() => setHovered()}
                overlay={(
                  <Popover id="popover-basic">
                    <Popover.Content style={{ color: '#636363' }}>{`Updated: ${moment(activityDate).format('MMMM Do YYYY, h:mm a')}`}</Popover.Content>
                  </Popover>
              )}
              >
                <span>{moment(activityDate).fromNow()}</span>
              </OverlayTrigger>
            </div>
            {tileBadges}
          </div>
        )}
    </div>
  );
}
