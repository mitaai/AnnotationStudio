import { useEffect, useState } from 'react';
import moment from 'moment';
import { OverlayTrigger, Popover, ProgressBar } from 'react-bootstrap';
import { XCircleFill } from 'react-bootstrap-icons';
import TileBadge from '../TileBadge';
import styles from './DashboardChannels.module.scss';
import { updateIdeaSpaceData } from '../../utils/ideaspaceUtils';

export default function IdeaSpaceTile({
  id,
  annotationIds = {},
  name = '',
  activityDate,
  onClick = () => {},
  onDelete = () => {},
  updateIdeaSpace = () => {},
  annotationsBeingDragged,
  setAnnotationsBeingDragged = () => {},
}) {
  const [hovered, setHovered] = useState();
  const [deleteHovered, setDeleteHovered] = useState();
  const [focused, setFoucsed] = useState();
  const [dragEnter, setDragEnter] = useState();
  const [status, setStatus] = useState();
  const classNames = [
    styles.tile,
    hovered ? styles.tileHovered : '',
    deleteHovered ? styles.tileDeleteHovered : '',
    focused ? styles.tileFocused : '',
    dragEnter ? styles.tileDragEnter : '',
    annotationsBeingDragged && !dragEnter ? styles.tileOpenForAnnotations : '',
    status && status.annotationsRecieved ? styles.annotationsRecieved : '',
  ].join(' ');

  const numberOfAnnotations = annotationIds ? Object.keys(annotationIds).length : 0;
  const annotationsText = `${numberOfAnnotations} annotation${numberOfAnnotations === 1 ? '' : 's'}`;

  const addAnnotationsToIdeaSpace = async () => {
    setStatus({ annotationsRecieved: true });
    const newAnnotationIds = {};
    const annotationIdsArray = Object.keys(annotationIds);
    const dateAdded = new Date();
    annotationsBeingDragged.ids.map((aid) => {
      if (!annotationIdsArray.includes(aid)) {
        newAnnotationIds[aid] = dateAdded;
      }
      return null;
    });
    const numberOfNewAnnotationIds = Object.keys(newAnnotationIds).length;
    const numberOfExistingAnnotationIds = annotationsBeingDragged.ids.length
      - numberOfNewAnnotationIds;
    setAnnotationsBeingDragged();
    if (numberOfNewAnnotationIds > 0) {
      await updateIdeaSpaceData({
        id,
        annotationIds: { ...newAnnotationIds, ...annotationIds },
      })
        .then(async (res) => {
          updateIdeaSpace(res.value);
          setStatus({
            numberOfNewAnnotations: numberOfNewAnnotationIds,
            numberOfExistingAnnotations: numberOfExistingAnnotationIds,
            done: true,
          });
        })
        .catch(() => {
        // pass
        });
    } else {
      setStatus({
        numberOfNewAnnotations: numberOfNewAnnotationIds,
        numberOfExistingAnnotations: numberOfExistingAnnotationIds,
        done: true,
      });
    }
  };

  let content = <></>;
  if (status === undefined) {
    content = (
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}
      >
        <div className={styles.memberText}>
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
            <span>{`Edited ${moment(activityDate).fromNow()}`}</span>
          </OverlayTrigger>
        </div>
        <TileBadge key="annotationsText" color="grey" text={annotationsText} />
      </div>

    );
  } else if (status.annotationsRecieved) {
    content = (
      <ProgressBar
        animated
        now={100}
        variant="success"
        label={`saving annotation${annotationsBeingDragged && annotationsBeingDragged.ids.length > 1 ? 's' : ''}`}
      />
    );
  } else if (status.done) {
    const addedAnnotations = status.numberOfNewAnnotations === 0 ? <></> : (
      <TileBadge
        key="addedAnnotationsText"
        color="green"
        text={status.numberOfNewAnnotations === 1 ? 'Annotation added' : `${status.numberOfNewAnnotations} annotations added`}
        marginLeft={3}
      />
    );
    let existingText = '';
    let existingAnnotations = <></>;

    if (status.numberOfExistingAnnotations > 0) {
      if (status.numberOfExistingAnnotations === 1) {
        if (status.numberOfNewAnnotations === 0) {
          existingText = 'That annotation already exists in this Idea Space';
        } else {
          existingText = '1 annotation already exists in this Idea Space';
        }
      } else {
        existingText = `${status.numberOfExistingAnnotations} annotations already exist in Idea Space`;
      }
      existingAnnotations = (
        <TileBadge
          key="existingAnnotationsText"
          color="red"
          maxWidth={300}
          text={existingText}
        />
      );
    }

    content = (
      <div style={{
        display: 'flex',
        flexDirection: 'row-reverse',
      }}
      >
        {addedAnnotations}
        {existingAnnotations}
      </div>
    );
  }

  useEffect(() => {
    if (status && status.done) {
      setTimeout(() => {
        setStatus();
      }, 3000);
    }
  }, [status]);

  return (
    <div
      className={classNames}
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
      onDragEnter={(e) => {
        e.preventDefault();
        setDragEnter(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragEnter(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragEnter();
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (annotationsBeingDragged) {
          addAnnotationsToIdeaSpace();
        }
        setDragEnter();
      }}
      role="button"
      tabIndex={0}
    >
      <XCircleFill
        className={styles.deleteBtn}
        onMouseOver={() => setDeleteHovered(true)}
        onMouseOut={() => setDeleteHovered()}
        size={14}
      />
      <div className={`${styles.annotatedText} ${name === '' ? styles.untitledText : ''}`}>{name === '' ? 'Untitled' : name}</div>
      {content}
    </div>
  );
}
