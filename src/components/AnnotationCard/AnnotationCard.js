import { useEffect, useState } from 'react';
import $ from 'jquery';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  FormControl,
  Button,
  Badge,
  Dropdown,
  ListGroup,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';

import { postAnnotation } from '../../utils/annotationUtil';

function AddHoverEventListenersToAllHighlightedText() {
  // console.log('annotation-highlighted-text', $('.annotation-highlighted-text'));
  $('.annotation-highlighted-text').on('mouseover', (e) => {
    // highlighting all every piece of the annotation a different color by setting it to active
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).addClass('active');
    // highligthing the correct annotation on the left or right channel that the user is hovering
    $(`#${$(e.target).attr('annotation-id')}`).addClass('active');

    // we need to higlight any text that is highlighted text but a parent of this dom element. This is what happens if somone annotates a piece of text inside of another piece of annotated text
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).parents('.annotation-highlighted-text').each((index, elmnt) => {
      // highlighting ever piece of text that is highlighted and is the parent of the text that is currently being highlighted
      $(`.annotation-highlighted-text[annotation-id='${$(elmnt).attr('annotation-id')}']`).addClass('active');
      // highlighting the correct annotation that matches this specific highlighted text that is the parent of the text that is currently getting hovered
      $(`#${$(elmnt).attr('annotation-id')}`).addClass('active');
    });
  }).on('mouseout', (e) => {
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).removeClass('active');
    $(`#${$(e.target).attr('annotation-id')}`).removeClass('active');

    // we need to higlight any text that is highlighted text but a parent of this dom element. This is what happens if somone annotates a piece of text inside of another piece of annotated text
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).parents('.annotation-highlighted-text').each((index, elmnt) => {
      // highlighting ever piece of text that is highlighted and is the parent of the text that is currently being highlighted
      $(`.annotation-highlighted-text[annotation-id='${$(elmnt).attr('annotation-id')}']`).removeClass('active');
      // highlighting the correct annotation that matches this specific highlighted text that is the parent of the text that is currently getting hovered
      $(`#${$(elmnt).attr('annotation-id')}`).removeClass('active');
    });
  });
}


/*

"annotation data structure"

{
  "id": <String> (valid ObjectID),
  "type": "Annotation",
  "creator": {
    "name": <String>,
    "email": <String> (valid email)
  },
  "permissions": {
    "groups": Array<String> (valid ObjectID)> or undefined,
    "documentOwner": <Boolean>,
  }
  "created": <Date>,
  "modified": <Date>,
  "body": {
    "type": "TextualBody",
    "value": <String> (valid HTML),
    "tags": Array<String>,
    "format": "text/html",
    "language": <String> (valid W3C language tag)
  },
  "target": {
    "document": {
      "slug": <String> (valid slug),
      "format": "text/html",
      ...metadata
    },
    "selector": {
      "type": "TextQuoteSelector",
      "exact": <String>,
      "prefix": <String>,
      "suffix": <String>,
    }
  }
}
*/


function AnnotationCard({
  side, annotation, focusOnAnnotation, initializedAsEditing, user,
}) {
  const [annotationData, setAnnotationData] = useState({ ...annotation });
  const [newAnnotationTags, setNewAnnotationTags] = useState(null);
  const [newAnnotationPermissionsShareWithGroups, setNewAnnotationPermissionsShareWithGroups] = useState(null);
  const [newAnnotationText, setNewAnnotationText] = useState(initializedAsEditing !== undefined ? '' : null);
  const [newAnnotation, setNewAnnotation] = useState(initializedAsEditing !== undefined ? initializedAsEditing : false);
  const [cancelingAnnotation, setCancelingAnnotation] = useState(false);
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [editing, setEditing] = useState(initializedAsEditing !== undefined ? initializedAsEditing : false);
  const [expanded, setExpanded] = useState(initializedAsEditing !== undefined ? initializedAsEditing : false);
  const [updateFocusOfAnnotation, setUpdateFocusOfAnnotation] = useState(initializedAsEditing !== undefined ? initializedAsEditing : false);

  function AddClassActive(id) {
    // changing color of annotation
    $(`#${id}`).addClass('active');
    // changing color of highlighted text
    $(`.annotation-highlighted-text[annotation-id='${id}']`).addClass('active');
  }

  function RemoveClassActive(id) {
    // removing color of annotation
    $(`#${id}`).removeClass('active');
    // setting color of highlighted text back to default
    $(`.annotation-highlighted-text[annotation-id='${id}']`).removeClass('active');
  }

  function SaveAnnotation() {
    if (savingAnnotation || cancelingAnnotation) { return; }// if we are already saving the annotation then don't try to run the function again
    setSavingAnnotation(true);

    // we need to reassign values to the annotationData
    const newAnnotationData = JSON.parse(JSON.stringify(annotationData));
    if (newAnnotationTags !== null) {
      newAnnotationData.body.tags = newAnnotationTags.split(' ');
    }
    if (newAnnotationPermissionsShareWithGroups !== null) {
      if (newAnnotationPermissionsShareWithGroups) {
        newAnnotationData.permissions.groups = newAnnotationData.creator_groups;
      } else {
        newAnnotationData.permissions.groups = [];
      }
    }
    if (newAnnotationText !== null) {
      newAnnotationData.body.value = newAnnotationText;
    }

    console.log({
      creator: newAnnotationData.creator,
      permissions: newAnnotationData.permissions,
      body: newAnnotationData.body,
      target: newAnnotationData.target,
    });

    postAnnotation({
      creator: newAnnotationData.creator,
      permissions: newAnnotationData.permissions,
      body: newAnnotationData.body,
      target: newAnnotationData.target,
    }).then((response) => {
      console.log(response);
      newAnnotationData.db_id = response.insertedId;// the new annotation already has an id but this id relates to the
      newAnnotationData.modified = new Date();
      setSavingAnnotation(false);
      setNewAnnotation(false);
      setEditing(false);
      // once the new annotation data saves properly on the database then we can update the annotation data
      setAnnotationData(newAnnotationData);

      // after setting the annotation data we need to reset the "new" data back to null
      setNewAnnotationTags(null);
      setNewAnnotationPermissionsShareWithGroups(null);
      setNewAnnotationText(null);
      // after we have saved the annotation the highlighted text needs to change its class from  "text-currently-being-annotated active" to "annotation-highlighted-text"
      $('.text-currently-being-annotated.active').addClass('annotation-highlighted-text');
      $('.text-currently-being-annotated.active').removeClass('text-currently-being-annotated active');
      AddHoverEventListenersToAllHighlightedText();
      // we also need to make the document selectable again
      $('#document-content-container').removeClass('unselectable');
      // then after everything is done we will focus on the annotation so that things get shifted to their correct spots
      focusOnAnnotation();
    }).catch((err) => {
      console.log(err);
      setSavingAnnotation(false);
    });
  }

  function CancelAnnotation() {
    if (cancelingAnnotation || savingAnnotation) { return; }// if we are already canceling the annotation then don't try to run the function again

    if (newAnnotation) {
      setCancelingAnnotation(true);
      // simulating the time it takes to delete the annotation from the database and make sure the connection is secure and worked properly
      setTimeout(() => {
        // if it is a new annotation then cancel should delete the annotation
      // we need to grab the data on the annotations and then edit it by removing the current one the user just canceled and then saving this edited version of the annotations object
        const annotations = JSON.parse($('#document-container').attr('annotations'));
        const indexOfAnnotationToDelete = annotations[side].findIndex((a) => a._id === annotationData._id);
        annotations[side].splice(indexOfAnnotationToDelete, 1);
        $('#document-container').attr('annotations', JSON.stringify(annotations));
        // now that we have removed the annotation from the data we need to remove it from the dom
        $(`#${annotationData._id}.annotation-card-container`).remove();
        // after we remove the annotation we need to remove the classes from the text that was highlighted and then make the document selectable again
        $('.text-currently-being-annotated.active').removeClass('text-currently-being-annotated active');
        // we also need to make the document selectable again
        $('#document-content-container').removeClass('unselectable');
      }, 1000);
    } else {
      setNewAnnotationTags(null);
      setNewAnnotationPermissionsShareWithGroups(null);
      setNewAnnotationText(null);
      // if the annotation is not new then canceling should just return it to its previous state
      setEditing(false); setUpdateFocusOfAnnotation(true);
    }
  }

  function handleTagChange(event) {
    setNewAnnotationTags(event.target.value);
  }

  function handleAnnotationTextChange(event) {
    setNewAnnotationText(event.target.value);
  }

  function handleAnnotationPermissionsChange(event) {
    setNewAnnotationPermissionsShareWithGroups($(event.target).prop('checked'));
  }

  useEffect(() => {
    if (updateFocusOfAnnotation) {
      focusOnAnnotation();
      setUpdateFocusOfAnnotation(false);
    }
  });

  return (
    <>
      <Card
        id={annotationData._id}
        onClick={() => { setUpdateFocusOfAnnotation(true); }}
        onMouseOver={() => { AddClassActive(annotationData._id); }}
        onMouseOut={() => { RemoveClassActive(annotationData._id); }}
        className={`annotation-card-container ${newAnnotation ? 'new-annotation' : ''}`}
        style={side === 'left' ? { left: '5px' } : { right: '5px' }}
      >
        <div className="line1" />
        <div className="line2" />
        {side === 'left'
          ? (
            <>
              <span className="annotation-pointer-background-left" />
              <span className="annotation-pointer-left" />
            </>
          )
          : (
            <>
              <span className="annotation-pointer-background-right" />
              <span className="annotation-pointer-right" />
            </>
          )}
        {expanded ? (
          <>
            <Card.Header className="annotation-header">
              <span className="float-left">{annotationData.creator.name}</span>
              <span className="float-right">
                <span>{annotationData.modified === undefined ? '' : moment(annotationData.modified.toString()).format('MM/DD/YYYY')}</span>
                {user.email !== annotationData.creator.email ? (
                  <Dropdown className="annotation-more-options-dropdown">
                    <Dropdown.Toggle variant="light" id="dropdown-basic">
                      <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" className="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                      </svg>
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="annotation-more-options-dropdown-menu">
                      <Dropdown.Item href="#/action-1" onClick={() => { setEditing(true); setUpdateFocusOfAnnotation(true); }}>Edit</Dropdown.Item>
                      <Dropdown.Item href="#/action-2">Delete</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : ''}

              </span>
            </Card.Header>
            {editing
              ? (
                <>
                  <Form>
                    <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                      <ListGroup.Item className="annotation-body">
                        <Form.Group controlId="exampleForm.ControlTextarea1">
                          <Form.Control
                            style={{ fontSize: '12px' }}
                            as="textarea"
                            rows="3"
                            placeholder="annotation"
                            defaultValue={annotationData.body.value}
                            onChange={handleAnnotationTextChange}
                            readOnly={savingAnnotation}
                          />
                        </Form.Group>
                      </ListGroup.Item>
                      <ListGroup.Item className="annotation-tags">
                        <Form.Group controlId="formGroupEmail">
                          <Form.Control
                            type="text"
                            style={{ fontSize: '12px' }}
                            placeholder="add some tags here..."
                            defaultValue={annotationData.body.tags.join(' ')}
                            onChange={handleTagChange}
                            readOnly={savingAnnotation}
                          />
                        </Form.Group>
                      </ListGroup.Item>
                    </ListGroup>
                    <Row>
                      <Col lg={12}>
                        <input id="checkbox-share-annotation" type="checkbox" onChange={handleAnnotationPermissionsChange} />
                        <span id="text-share-annotation">Share with my groups</span>
                        {newAnnotationTags === null && newAnnotationPermissionsShareWithGroups === null && newAnnotationText === null ? ''
                          : (
                            <Button
                              className="btn-save-annotation-edits float-right"
                              onClick={SaveAnnotation}
                              variant="primary"
                              size="sm"
                            >
                              {savingAnnotation ? (
                                <>
                                  <span style={{ marginRight: '3px' }}>Save</span>
                                  <Spinner animation="border" variant="light" size="sm" />
                                </>
                              ) : 'Save'}
                            </Button>
                          )}
                        <Button
                          className="btn-cancel-annotation-edits float-right"
                          onClick={CancelAnnotation}
                          variant="secondary"
                          size="sm"
                        >
                          {cancelingAnnotation ? (
                            <>
                              <span style={{ marginRight: '3px' }}>Cancel</span>
                              <Spinner animation="border" variant="light" size="sm" />
                            </>
                          ) : 'Cancel'}
                        </Button>
                      </Col>
                    </Row>

                  </Form>
                </>
              )
              : (
                <>
                  <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                    {annotationData.body.value.length > 0 ? (
                      <ListGroup.Item className="annotation-body">
                        {annotationData.body.value}
                        <span
                          style={{ margin: '0px 0px 0px 5px', color: '#007bff' }}
                          onClick={() => { setExpanded(false); setUpdateFocusOfAnnotation(true); }}
                        >
                          show less
                        </span>
                      </ListGroup.Item>
                    ) : ''}
                    {annotationData.body.tags.join('').length > 0 ? (
                      <>
                        <ListGroup.Item className="annotation-tags">
                          {annotationData.body.tags.map((tag, index) => {
                            if (tag === '') { return ''; }
                            return <Badge key={index} variant="secondary">{tag}</Badge>;
                          })}
                        </ListGroup.Item>
                      </>
                    ) : <></>}

                  </ListGroup>
                </>
              )}
          </>
        ) : (
          <>
            <OverlayTrigger
              key={annotationData._id}
              placement="top"
              overlay={(
                <Tooltip id={`tooltip-${annotationData._id}`}>
                  {annotationData.creator.name}
                </Tooltip>
      )}
            >
              <Card.Header className="annotation-header" onClick={() => { setExpanded(true); }}>
                <div className="truncated-annotation">{annotationData.body.value}</div>
              </Card.Header>
            </OverlayTrigger>
          </>
        )}

      </Card>
      <style jsx global>
        {`

        .truncated-annotation {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .line1, .line2 {
            position:absolute;
            width:1px;
            margin-top:-1px;
            background-color:#eeeeee;
            z-index: 2;
            transition: background-color 0.5s;
        }

        .annotation-card-container.new-annotation {
            border: 1px solid #007bff;
        }

        .annotation-card-container.new-annotation .line1, .annotation-card-container.new-annotation .line2 {
            background-color: #007bff;
            z-index: 3;
        }

        .annotation-card-container.new-annotation .annotation-pointer-background-left {
            border-left-color: #007bff;
        }

        .annotation-card-container.new-annotation .annotation-pointer-background-right {
            border-right-color: #007bff;
        }


        .annotation-card-container.active .line1, .annotation-card-container.active .line2 {
            background-color: #007bff;
            z-index: 3;
        }

        .annotation-card-container.active .annotation-pointer-background-left {
            border-left-color: #007bff;
        }

        .annotation-card-container.active .annotation-pointer-background-right {
            border-right-color: #007bff;
        }

        .annotation-card-container .form-group {
            margin-bottom: 0px;
        }

        .annotation-card-container {
            position: absolute;
            cursor: pointer;
            border: 1px solid rgb(220, 220, 220);
            border-radius: 0px;
            width: 100%;
            transition: border-color 0.5s;
            transition: top 0.5s;
        }

        .annotation-card-container.active {
            border: 1px solid #007bff;
        }


        .btn-save-annotation-edits, .btn-cancel-annotation-edits {
            margin: 0px 5px 5px 0px;
        }

        .annotation-more-options-dropdown-menu {
            font-size: 12px;
        }

        #text-share-annotation {
            font-size: 12px;
            top: -2px;
            position: relative;
        }

        #checkbox-share-annotation {
            margin: 0px 5px 0px 10px;
        }

        #input-group-share-annotation {
            margin-left: 10px;
        }

        .annotation-more-options-dropdown-menu .dropdown-item {
            padding: 0.25rem 0.75rem;
        }

        .annotation-more-options-dropdown {
            display: inline;
            position: relative;
            top: -14px;
            left: 3px;
        }

        #dropdown-basic {
            padding: 0px;
            background-color: basic;
            height: 0px;
            border: none;
            box-shadow: none;
        }
        #dropdown-basic::after {
            display: none;
        } 
          
          .annotation-pointer-background-left {
              position: absolute;
              right: -20px;
              top: 3px;
              width: 0px;
              height: 0px;
              border: 10px solid transparent;
              border-left-color: rgb(220,220,220);
              transition: border-left-color 0.5s;
          }
          .annotation-pointer-left {
              position: absolute;
              right: -19px;
              top: 3px;
              width: 0px;
              height: 0px;
              border: 10px solid transparent;
              border-left-color: rgb(250,250,250);
          }

        .annotation-pointer-background-right {
            position: absolute;
            left: -20px;
            top: 3px;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-right-color: rgb(220,220,220);
            transition: border-right-color 0.5s;
        }
        .annotation-pointer-right {
            position: absolute;
            left: -19px;
            top: 3px;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-right-color: rgb(250,250,250);
        }

          .annotation-header {
            padding: 0.30rem 0.60rem !important;
            font-size: 12px;
            background-color: rgb(250,250,250);
          }

          .annotation-body {
            padding: 0.30rem 0.60rem !important;
            font-size: 12px;
          }

          .annotation-tags {
            padding: 0.30rem 0.60rem !important;
            font-size: 16px;
            font-weight: 500 !important;
          }

          .annotation-tags .badge {
              margin-right: 3px;
          }


          `}
      </style>
    </>
  );
}

export default AnnotationCard;
