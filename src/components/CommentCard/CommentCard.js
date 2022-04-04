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
  Card, ListGroup, OverlayTrigger, Tooltip,
} from 'react-bootstrap';
import {
  Check,
  X,
} from 'react-bootstrap-icons';

function addHoverEventListenersToAllHighlightedText() {
  $('.comment-card-highlighted-text').on('mouseover', (e) => {
    // highlighting all every piece of the comment-card a different color by setting it to active
    $(`.comment-card-highlighted-text[comment-card-id='${$(e.target).attr('comment-card-id')}']`).addClass('active');
    // highligthing the correct comment-card on the left or right channel that the user is hovering
    $(`#${$(e.target).attr('comment-card-id')}`).addClass('active');
  }).on('mouseout', (e) => {
    if (!$(`#${$(e.target).attr('comment-card-id')}`).hasClass('expanded')) {
      $(`.comment-card-highlighted-text[comment-card-id='${$(e.target).attr('comment-card-id')}']`).removeClass('active');
      $(`#${$(e.target).attr('comment-card-id')}`).removeClass('active');
    }
  });
}

function CommentCard({
  id,
  expanded,
}) {
  const [hovered, setHovered] = useState();

  const leftRightPositionForcommentCard = 15;

  const setExpanded = (bool) => {
    // expandcomment-card(comment-cardData._id, bool);
  };

  function AddClassActive(id) {
    // changing color of highlighted text
    $(`.comment-card-highlighted-text[comment-card-id='${id}']`).addClass('active');
  }

  function RemoveClassActive(id) {
    if (!expanded) {
      $(`#${id}`).removeClass('active');
    }
    // setting color of highlighted text back to default
    $(`.comment-card-highlighted-text[comment-card-id='${id}']`).removeClass('active');
  }

  const expandedAndFocus = () => {
    if (!expanded) {
      setExpanded(true);
    }
    // setUpdateFocusOfcomment-card(true);
  };

  /*
  useEffect(() => {
    if (updateFocusOfcomment-card) {
      focusOncomment-card();
      setUpdateFocusOfcomment-card();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateFocusOfcomment-card]);
  */

  useEffect(() => {
    if (expanded || hovered) {
      // AddClassActive(id);
    } else {
      // RemoveClassActive(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, hovered]);

  const cardRightOffset = 10;

  return (
    <>
      <Card
        id={id}
        onMouseOver={() => { setHovered(true); }}
        onMouseLeave={() => { setHovered(); }}
        className={`comment-card-card-container left-comment-card ${expanded ? 'expanded' : ''} ${expanded || hovered ? 'active' : ''}`}
        style={{ right: -cardRightOffset }}
      >
        <div
          className="line1"
          style={{ zIndex: -1 }}
          onClick={expandedAndFocus}
        />
        <div
          className="line2"
          style={{ zIndex: -1 }}
          onClick={expandedAndFocus}
        />
        <>
          <span className="comment-card-pointer-background-left" />
          <span className="comment-card-pointer-left" />
        </>

        <>
          <ListGroup variant="flush" style={{ borderTop: 'none', zIndex: 1, position: 'relative' }}>
            <ListGroup.Item
              className="comment-card-body"
              onClick={() => {
                console.log('comment-card-body clicked');
              }}
            >
              <>
                <span className="text-quote">
                  <img
                    className="quote-svg"
                    src="/quote-left-svg.svg"
                    alt="quote left"
                  />
                  This is some dummy data that is acting as a placeholder
                </span>
              </>
            </ListGroup.Item>

          </ListGroup>
          <Card.Header
            className="comment-card-header grey-background"
            style={{ display: 'flex', alignItems: 'center' }}
            onClick={() => {
              console.log('annotaiton-header');
              // setUpdateFocusOfcomment-card(true);
            }}
          >
            <span style={{ padding: '6px 0px' }}>Hello</span>
            <span style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6px 0px',
            }}
            >
              <div style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                background: '#616161',
                marginLeft: 10,
                marginRight: 10,
              }}
              />
              <span>Good Bye</span>
            </span>
            <span style={{ flex: 1 }} />
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {hovered && (
              <>
                <OverlayTrigger
                  placement="bottom"
                  overlay={(
                    <Tooltip className="styled-tooltip bottom">
                      Resolve comment
                    </Tooltip>
                    )}
                >
                  <span
                    className="edit-comment-card-btn"
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
                    className="delete-comment-card-btn"
                    size={22}
                    onClick={() => console.log('delete-comment-card-btn')}
                  />
                </OverlayTrigger>
              </>
              )}
            </span>
          </Card.Header>
        </>

      </Card>
      <style jsx global>
        {`
          .delete-comment-card-btn, .edit-comment-card-btn {
            color: #616161;
          }
  
          .delete-comment-card-btn:hover {
            color: #AC4545;
          }
  
          .edit-comment-card-btn:hover {
            color: #015999;
          }
  
          .truncated-comment-card, .truncated-comment-card .text-quote {
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            display: -webkit-box;
            max-height: 20px;
          }
  
          .comment-card-header .truncated-comment-card.hovered {
            padding-right: 18px !important;
          }
  
          .tag-already-exists {
            font-size: 9px;
          }
  
          .user-share-email {
            font-size: 9px;
          }
  
          .comment-card-permissions {
            padding: 2px 5px;
          }
  
          #dropdown-permission-options {
            font-size: 9px;
            padding: 3px 6px;
          }
  
          #dropdown-permission-options-container {
            display: inline-block;
            position: relative;
            top: -2px;
          }
  
          #popover-share-comment-card-options.z-index-1 {
            z-index: 1;
          }
  
          .comment-card-tags .rbt-input-main{
            font-size: 12px;
            line-height: 20px;
          }
  
          .comment-card-tags .rbt-input {
            border-radius: 0px;
            border: none;
            padding-left: 5px;
          }
  
          #typeahead-share-comment-card-users {
            width: 100%;
          }
  
          #typeahead-share-comment-card-users-container {
            margin-top: 2px;
            display: none;
          }
  
          #typeahead-comment-card-tags {
            padding: 0px;
          }
  
          #typeahead-comment-card-tags .tag-name {
            font-size: 12px;
          }
  
          #typeahead-comment-card-tags .menu-header {
            font-size: 12px;
            padding: 2px 4px;
            border-bottom: 1px solid #eeeeee;
            color: #424242;
          }
  
          #typeahead-comment-card-tags .menu-no-results {
            text-align: center;
            font-size: 12px;
            color: #616161;
            padding: 4px 0px;
          }
  
          #typeahead-share-comment-card-users-container .rbt-input-main {
            font-size: 12px;
            line-height: 20px;
          }
  
          #typeahead-share-comment-card-users-container.show {
            display: block;
          }
  
          #typeahead-share-comment-card-users-container .rbt-input {
            padding: 3px 0px 2px 0px;
            border: none;
            border-bottom: 1px solid #eeeeee;
            border-radius: 0px;
          }
  
          .comment-card-tag-token, .comment-card-share-token {
            font-size: 12px;
          }
  
          #popover-share-comment-card-header {
            font-size: 14px;
          }
  
          #popover-share-comment-card-body {
            width: 300px;
          }
  
          .quote-svg {
            opacity: 0.8;
            width: 8px;
            position: relative;
            top: -3px;
            margin-right: 3px;
          }
  
          .text-quote {
            color: #757575;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;  
            overflow: hidden;
          }
  
          .comment-card-pointer-background-left, .comment-card-pointer-left, .comment-card-pointer-background-right, .comment-card-pointer-right {
            visibility: hidden;
          }
  
          .active .comment-card-pointer-background-left, .active .comment-card-pointer-left, .active .comment-card-pointer-background-right, .active .comment-card-pointer-right {
            visibility: visible;
          }
  
          .active .line1, .active .line2 {
            visibility: visible;
          }
  
          .comment-card-header.card-header {
            border-bottom: none !important;
          }
  
          .comment-card-card-container > .list-group {
            border-bottom: none !important;
          }
  
          .line1, .line2 {
            visibility: hidden;
            position: absolute;
            width: 1px;
            margin-top:-1px;
            background-color:#eeeeee;
            z-index: 2;
            transition: background-color 0.5s;
          }
  
          .comment-card-card-container.active .line1, .comment-card-card-container.active .line2 {
            background-color: rgba(255, 165, 10, 0.5);
            z-index: 3;
          }
  
          .comment-card-card-container.new-comment-card .line1, .comment-card-card-container.new-comment-card .line2 {
            background-color: rgba(1,89,153,.5) !important;
          }
  
          .comment-card-card-container.active .line1, .comment-card-card-container.active .line2 {
            z-index: 3;
          }
  
          .comment-card-card-container.active .comment-card-pointer-background-left {
              border-left-color: rgba(255, 165, 10, 0.5);
          }
  
          .comment-card-card-container.active .comment-card-pointer-background-right {
              border-right-color: rgba(255, 165, 10, 0.5);
          }
  
          .comment-card-card-container .form-group {
              margin-bottom: 0px;
          }
  
          .comment-card-card-container {
            position: absolute;
            cursor: pointer;
            border: 1px solid rgb(220, 220, 220);
            border-radius: 0px;
            width: calc(100% + ${cardRightOffset}px);
            transition: all 0.5s;
            transition-property: border-color, top, left, right;
            max-width: 375px;
          }
  
          .comment-card-card-container.active {
            border-color: rgba(255, 165, 10, 0.5);
          }
  
          .btn-save-comment-card-edits {
            margin-left: 3px;
            font-size: 9px;
          }
  
          .btn-cancel {
            font-size: 9px;
          }
  
  
          .btn-cancel-comment-card-edits {
            font-size: 18px;
            border-radius: 50%;
            line-height: 6.5px;
            padding-left: 2.5px;
            width: 18px;
            height: 18px;
            padding-top: 2.3px;
            background-color: transparent;
          }
  
          .btn-cancel-comment-card-edits:hover {
            color: #AC4545 !important;
          }
  
          .comment-card-more-options-dropdown-menu {
              font-size: 12px;
          }
  
          #text-share-comment-card {
              font-size: 12px;
              top: -2px;
              position: relative;
          }
  
          #input-group-share-comment-card {
              margin-left: 10px;
          }
  
          .comment-card-more-options-dropdown-menu .dropdown-item {
              padding: 0.25rem 0.75rem;
          }
  
          .comment-card-more-options-dropdown {
              display: inline;
              position: relative;
              top: -14px;
              left: 3px;
          }
  
          .comment-card-more-options-dropdown svg {
              position: relative !important;
          }
  
          #dropdown-basic {
              padding: 0px;
              border: none;
              height: 0px;
              background: white;
              box-shadow: none;
          }
          #dropdown-basic::after {
              display: none;
          } 
            
          .comment-card-pointer-background-left {
              position: absolute;
              right: -20px;
              top: 3px;
              width: 0px;
              height: 0px;
              border: 10px solid transparent;
              border-left-color: rgb(220,220,220);
              transition: border-left-color 0.5s;
          }
  
          .comment-card-pointer-left {
              position: absolute;
              right: -19px;
              top: 3px;
              z-index: 1;
              width: 0px;
              height: 0px;
              border: 10px solid transparent;
              border-left-color: white;
          }
  
        .comment-card-pointer-background-right {
            position: absolute;
            left: -20px;
            top: 3px;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-right-color: rgb(220,220,220);
            transition: border-right-color 0.5s;
        }
  
        .comment-card-pointer-right {
            position: absolute;
            left: -19px;
            top: 3px;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-right-color: white;
        }
  
        .comment-card-header {
          padding: 0px 6px;
          font-size: 12px;
          background: white;
        }
  
        .comment-card-header.editing {
          font-size: 12px !important;
        }
  
        .comment-card-header.grey-background:hover {
          transition: background-color 0.25s;
          background-color: rgba(255,165,10,0.10) !important
        }
  
        .grey-background {
          background-color: rgb(250,250,250) !important;
        }
  
        .editing {
          z-index: 2 !important;
        }
  
        .editing .comment-card-body {
          padding: 0px !important;
        }
  
        .editing .comment-card-tags {
          padding: 0px !important;
        }
  
        .comment-card-body {
          padding: 0.3rem;
          font-size: 12px;
          border-bottom-width: 1px !important;
        }
  
        .comment-card-body textarea {
          border: none;
          border-radius: 0px;
          padding: 6px;
          min-height: 200px;
        }
  
        .comment-card-body .tox.tox-tinymce {
          border: none;
        }
  
        .comment-card-tags {
          padding: 0px 0.3rem 0.3rem 0.3rem !important; 
          font-size: 16px;
          font-weight: 500 !important;
          border-bottom-width: 1px !important
        }
  
        .comment-card-tags  .rbt-input {
          border: none;
        }
  
        .comment-card-tags .badge {
            margin-right: 3px;
        }
  
        .comment-card-card-container p {
          margin-bottom: 0;
        }
  
        iframe, img {
          max-width: 100%;
        }
  
            `}
      </style>
    </>
  );
}

export default CommentCard;

