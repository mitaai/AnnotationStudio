/* eslint-disable jsx-a11y/mouse-events-have-key-events */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-underscore-dangle */
import {
  useEffect, useState,
} from 'react';
import { Editor } from '@tinymce/tinymce-react';
import ReactHtmlParser from 'react-html-parser';
import $ from 'jquery';
import moment from 'moment';
import {
  Card, ListGroup, OverlayTrigger, Tooltip, Badge,
} from 'react-bootstrap';
import {
  Check,
  X,
} from 'react-bootstrap-icons';
import styles from './CommentCard.module.scss';
import TileBadge from '../TileBadge';

function CommentCard({
  id,
  type = 'comment',
  setSourceTextMode = () => {},
  openDocument = () => {},
  documents = [],
  noPointer,
  setHeight = () => {},
}) {
  const types = {
    comment: {
      backgroundColor: '#e0e0e0',
      foregroundColor: '#fafafa',
    },
    warning: {
      backgroundColor: 'rgba(255, 210, 10, 0.5)',
      foregroundColor: '#fcfae8',
    },
    danger: {
      backgroundColor: 'rgba(255, 59, 10, 1.0)',
      foregroundColor: '#fff2f2',
    },
    success: {
      backgroundColor: '#015999',
      foregroundColor: '#edf3ff',
    },
  };

  const elementId = `comment-card-${id}`;

  const { backgroundColor, foregroundColor } = types[type];

  const pointer = (side, obj) => (
    <div
      id={`comment-card-${side}-pointer`}
      style={{ position: 'absolute', top: 55, ...obj }}
    >
      <svg
        style={{
          position: 'absolute',
          transform: 'rotate(-45deg)',
          boxShadow: '0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%)',
        }}
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0L15 15H0V0Z" fill="#e0e0e0" />
      </svg>
      <svg
        style={{
          position: 'absolute',
          top: -1,
          transform: 'rotate(-45deg)',
        }}
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0L15 15H0V0Z" fill="#FFFFFF" />
      </svg>
      <svg
        style={{
          position: 'absolute',
          left: -5,
          top: -4.5,
          transform: 'rotate(-225deg)',
        }}
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0L25 25H0V0Z" fill="#FFFFFF" />
      </svg>
    </div>
  );

  const pointers = (
    <>
      {pointer('left', { left: 10 })}
      {pointer('middle', { left: 'calc(50% - 12px)' })}
      {pointer('right', { right: 25 })}
    </>
  );

  const badges = documents.map(({ _id, title, slug }) => (
    <Badge
      key={_id}
      className={styles.sourceTextBadge}
      variant="light"
      onClick={() => {
        setSourceTextMode(true);
        openDocument(slug);
      }}
    >
      {title}
    </Badge>
  ));

  useEffect(() => {
    setHeight($(`#${elementId}`).height());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        id={elementId}
        className="comment-card left"
        style={{
          position: 'absolute',
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          width: 375,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 2px 0 rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%), 0 1px 5px 0 rgb(0 0 0 / 20%)',
        }}
      >
        <div
          style={{
            backgroundColor: foregroundColor,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            fontSize: 12,
            fontWeight: 'bold',
            padding: '0px 8px',
            flexDirection: 'row',
          }}
        >
          {!noPointer && pointers}
          <span style={{
            position: 'absolute',
            left: -10,
            top: -10,
            width: 0,
            height: 0,
            border: '10px solid transparent',
            borderRightColor: backgroundColor,
            transform: 'rotate(45deg)',
          }}
          />
          <span>This text matches  1 source texts</span>
          <span style={{ flex: 1 }} />
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <OverlayTrigger
              placement="bottom"
              overlay={(
                <Tooltip className="styled-tooltip bottom">
                  Resolve comment
                </Tooltip>
                    )}
            >
              <span
                className={styles.resolveCommentBtn}
              >
                <Check
                  style={{ marginRight: 1 }}
                  size={22}
                />
              </span>
            </OverlayTrigger>
            <OverlayTrigger
              placement="bottom"
              overlay={(
                <Tooltip className="styled-tooltip bottom">
                  Delete comment
                </Tooltip>
                    )}
            >
              <X
                className={styles.deleteCommentBtn}
                size={22}
                onClick={() => console.log('delete-comment-card-btn')}
              />
            </OverlayTrigger>
          </span>
        </div>
        <div style={{
          padding: '3px 6px 5px 6px',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          fontSize: 16,
          position: 'relative',
          zIndex: 2,
        }}
        >
          <div>
            {badges}
          </div>

        </div>
      </div>
    </>
  );
}

export default CommentCard;

