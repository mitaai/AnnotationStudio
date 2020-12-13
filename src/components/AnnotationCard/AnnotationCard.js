import { useEffect, useState, useContext } from 'react';
import $ from 'jquery';
import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Button,
  Badge,
  Dropdown,
  ListGroup,
  Spinner,
  OverlayTrigger,
  Tooltip,
  ButtonGroup,
  Popover,
  Modal,
} from 'react-bootstrap';

import {
  CheckCircleFill, TrashFill, QuestionCircle,
} from 'react-bootstrap-icons';
import {
  Typeahead, Menu, MenuItem, Token,
} from 'react-bootstrap-typeahead';
import { postAnnotation, updateAnnotationById, deleteAnnotationById } from '../../utils/annotationUtil';

import { DocumentAnnotationsContext, DocumentFiltersContext } from '../../contexts/DocumentContext';

function addHoverEventListenersToAllHighlightedText() {
  $('.annotation-highlighted-text').on('mouseover', (e) => {
    // highlighting all every piece of the annotation a different color by setting it to active
    $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).addClass('active');
    // highligthing the correct annotation on the left or right channel that the user is hovering
    $(`#${$(e.target).attr('annotation-id')}`).addClass('active');
  }).on('mouseout', (e) => {
    if (!$(`#${$(e.target).attr('annotation-id')}`).hasClass('expanded')) {
      $(`.annotation-highlighted-text[annotation-id='${$(e.target).attr('annotation-id')}']`).removeClass('active');
      $(`#${$(e.target).attr('annotation-id')}`).removeClass('active');
    }
  });
}

function DeepCopyObj(obj) {
  return JSON.parse(JSON.stringify(obj));
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
  side,
  annotation,
  focusOnAnnotation,
  deleteAnnotationFromChannels,
  user,
  showMoreInfoShareModal,
  setShowMoreInfoShareModal,
  membersIntersection,
}) {
  const [, , saveAnnotationChanges, allAnnotationTags] = useContext(DocumentAnnotationsContext);
  const [documentFilters, setDocumentFilters] = useContext(DocumentFiltersContext);
  const [annotationData, setAnnotationData] = useState({ ...annotation });
  const [newAnnotationTags, setNewAnnotationTags] = useState(null);
  const [newAnnotationPermissions, setNewAnnotationPermissions] = useState(null);
  const [newAnnotationText, setNewAnnotationText] = useState(annotation.editing !== undefined ? '' : null);
  const [cancelingAnnotation, setCancelingAnnotation] = useState(false);
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [deletingAnnotation, setDeletingAnnotation] = useState(false);
  const [expanded, setExpanded] = useState(annotation.editing);
  const [updateFocusOfAnnotation, setUpdateFocusOfAnnotation] = useState(annotation.editing);
  const [hovered, setHovered] = useState();
  const [selectedUsersToShare, setSelectedUsersToShare] = useState([]);
  const permissionText = ['Share', 'Shared with group(s)', selectedUsersToShare.length === 1 ? 'Shared with 1 user' : `Shared with ${selectedUsersToShare.length} users`];

  function AddClassActive(id) {
    // changing color of highlighted text
    $(`.annotation-highlighted-text[annotation-id='${id}']`).addClass('active');
  }

  function RemoveClassActive(id) {
    if (!expanded) {
      $(`#${id}`).removeClass('active');
    }
    // setting color of highlighted text back to default
    $(`.annotation-highlighted-text[annotation-id='${id}']`).removeClass('active');
  }

  function SetAndSaveAnnotationData(anno) {
    setAnnotationData(anno);
    saveAnnotationChanges(anno, side);
    setDocumentFilters(Object.assign(DeepCopyObj(documentFilters), { filterOnInit: true }));
  }

  function SaveAnnotation() {
    if (savingAnnotation || cancelingAnnotation) { return; }// if we are already saving the annotation then don't try to run the function again
    setSavingAnnotation(true);

    // we need to reassign values to the annotationData
    const newAnnotationData = JSON.parse(JSON.stringify(annotationData));
    if (newAnnotationTags !== null) {
      newAnnotationData.body.tags = newAnnotationTags.map((t) => {
        if (typeof (t) === 'object') { return t.tags; }
        return t;
      });
    }
    if (newAnnotationPermissions !== null) {
      if (newAnnotationPermissions === 0) {
        // user wants the annotation to be private
        newAnnotationData.permissions.groups = [];
        newAnnotationData.permissions.private = true;
        newAnnotationData.permissions.documentOwner = false;
      } else if (newAnnotationPermissions === 1) {
        // user wants the annotation to be shared with groups
        // getting the intersection between the groups that have access to this specific document and the groups that the user is in
        newAnnotationData.permissions.groups = newAnnotationData.target.document.groups.filter((id) => (user.groups.includes(id)));
        newAnnotationData.permissions.documentOwner = false;
        newAnnotationData.permissions.private = false;
      } else if (newAnnotationPermissions === 2) {
        // user wants annotation to be shared with document owner only
        newAnnotationData.permissions.groups = [];
        newAnnotationData.permissions.private = false;
        newAnnotationData.permissions.documentOwner = true;
      }
    }
    if (newAnnotationText !== null) {
      newAnnotationData.body.value = newAnnotationText;
    }

    if (annotationData.new) {
      postAnnotation({
        creator: newAnnotationData.creator,
        permissions: newAnnotationData.permissions,
        body: newAnnotationData.body,
        target: newAnnotationData.target,
      }).then((response) => {
        newAnnotationData.db_id = response.insertedId;// the new annotation already has an id but this id relates to the
        newAnnotationData.modified = new Date();
        newAnnotationData.new = false;
        newAnnotationData.editing = false;
        $($(`#document-content-container span[annotation-id='${newAnnotationData._id}']`).get(-1)).prepend("<span class='annotation-ending-marker'></span>");
        const annotationEnding = $(`#document-content-container span[annotation-id='${annotation._id}'] .annotation-ending-marker`);
        newAnnotationData.position.height = (annotationEnding.offset().top - newAnnotationData.position.top) + 18;
        setSavingAnnotation(false);
        // after setting the annotation data we need to reset the "new" data back to null
        setNewAnnotationTags(null);
        setNewAnnotationPermissions(null);
        setNewAnnotationText(null);
        // after we have saved the annotation the highlighted text needs to change its class from  "text-currently-being-annotated active" to "annotation-highlighted-text"
        $('.text-currently-being-annotated.active').addClass('annotation-highlighted-text');
        $('.text-currently-being-annotated.active').removeClass('text-currently-being-annotated active');
        addHoverEventListenersToAllHighlightedText();
        // we need to save this new data to the "#document-container" dom element attribute 'annotations'
        // we also need to make the document selectable again
        $('#document-content-container').removeClass('unselectable');
        // once the new annotation data saves properly on the database then we can update the annotation data
        SetAndSaveAnnotationData(newAnnotationData);
        // then after everything is done we will focus on the annotation so that things get shifted to their correct spots
        focusOnAnnotation();
      }).catch((err) => {
        console.log(err);
        setSavingAnnotation(false);
      });
    } else {
      updateAnnotationById(
        newAnnotationData.db_id === undefined ? newAnnotationData._id : newAnnotationData.db_id,
        newAnnotationData,
      ).then((response) => {
        newAnnotationData.modified = new Date();
        newAnnotationData.editing = false;
        newAnnotationData.new = false;
        setSavingAnnotation(false);
        // once the new annotation data saves properly on the database then we can update the annotation data
        SetAndSaveAnnotationData(newAnnotationData);

        // after setting the annotation data we need to reset the "new" data back to null
        setNewAnnotationTags(null);
        setNewAnnotationPermissions(null);
        setNewAnnotationText(null);
        // then after everything is done we will focus on the annotation so that things get shifted to their correct spots
        focusOnAnnotation();
      }).catch((err) => {
        console.log(err);
        setSavingAnnotation(false);
      });
    }
  }

  function CancelAnnotation() {
    if (cancelingAnnotation || savingAnnotation) { return; }// if we are already canceling the annotation then don't try to run the function again

    if (annotationData.new) {
      setCancelingAnnotation(true);
      // simulating the time it takes to delete the annotation from the database and make sure the connection is secure and worked properly
      setTimeout(() => {
        // if it is a new annotation then cancel should delete the annotation
        // after we remove the annotation we need to remove the classes from the text that was highlighted and then make the document selectable again
        $('.text-currently-being-annotated.active').removeClass('text-currently-being-annotated active');
        // we also need to make the document selectable again
        $('#document-content-container').removeClass('unselectable');
        // we need to delete this annotation from the channel it is in
        deleteAnnotationFromChannels(side, annotationData._id);
      }, 500);
    } else {
      setNewAnnotationTags(null);
      setNewAnnotationPermissions(null);
      setNewAnnotationText(null);
      // if the annotation is not new then canceling should just return it to its previous state
      annotationData.editing = false;
      SetAndSaveAnnotationData(annotationData);
      setUpdateFocusOfAnnotation(true);
    }
  }

  function DeleteAnnotation() {
    if (deletingAnnotation || savingAnnotation) { return; }// if we are already canceling the annotation then don't try to run the function again
    setDeletingAnnotation(true);
    deleteAnnotationById(annotationData.db_id === undefined ? annotationData._id : annotationData.db_id).then((response) => {
      // now that it is removed from the data base we will first remove any highlighted text related to the annotation remove it from the object that is keeping track of all the annotations
      $(`[annotation-id='${annotationData._id}']`).removeClass('annotation-highlighted-text');
      // we need to delete this annotation from the channel it is in
      deleteAnnotationFromChannels(side, annotationData._id);
    }).catch((err) => {
      console.log(err);
      setDeletingAnnotation(false);
    });
  }

  const renderToken = (option, { onRemove }, index) => {
    let tag = option;
    if (typeof (option) === 'object') {
      tag = option.tags;
    }
    return (
      <Token
        key={index}
        onRemove={onRemove}
        option={option}
        className="annotation-tag-token"
      >
        <span>{tag}</span>
      </Token>
    );
  };

  const renderMenu = (results, menuProps) => {
    const res = results.map((r) => {
      if (typeof (r) === 'object') {
        return {
          ...r,
          alreadyExists: newAnnotationTags !== null && newAnnotationTags.some((t) => r.tags === (typeof t === 'object' ? t.tags : t)),
        };
      }
      return r;
    });

    return (
      <Menu
        {...menuProps}
      >
        {res.map((result, index) => {
          const tagDiv = typeof (result) === 'object' ? (
            <>
              <div className="tag-name">{result.tags}</div>
              {result.alreadyExists && <div className="tag-already-exists">already used</div>}
            </>
          ) : <div className="tag-name">{result}</div>;
          return (
            <MenuItem option={result} key={index} position={index}>
              {tagDiv}
            </MenuItem>
          );
        })}
      </Menu>
    );
  };

  const renderUserShareToken = (option, { onRemove }, index) => (
    <Token
      key={index}
      onRemove={onRemove}
      option={option}
      className="annotation-share-token"
    >
      <span className="user-share-name">{option.name}</span>
    </Token>
  );

  const renderUserShareMenu = (results, menuProps) => (
    <Menu
      {...menuProps}
    >
      {results.map((result, index) => (
        <MenuItem option={result} key={index} position={index}>
          <div className="user-share-name">{result.name}</div>
          <div className="user-share-email">{result.email}</div>
        </MenuItem>
      ))}
    </Menu>
  );

  function handleAnnotationTextChange(event) {
    setNewAnnotationText(event.target.value);
  }

  function handleAnnotationPermissionsChange(num) {
    setNewAnnotationPermissions(num);
  }

  function showPermissionNumber() {
    let i = 0;
    if (newAnnotationPermissions !== null) {
      i = newAnnotationPermissions;
    } else if (annotationData.permissions.private) {
      // private
      i = 0;
    } else if (!annotationData.permissions.documentOwner && !annotationData.permissions.private) {
      i = 1;
    } else if (annotationData.permissions.documentOwner) {
      i = 2;
    }

    return i;
  }

  useEffect(() => {
    if (updateFocusOfAnnotation) {
      focusOnAnnotation();
      setUpdateFocusOfAnnotation(false);
    }

    // when the annotation is done rendering it should check if any of its corresponding text is active and if it is it should also add the class active to itself it doesn't already have it
    if ($(`.annotation-highlighted-text[annotation-id='${annotationData._id}']`).hasClass('active') && !$(`#${annotationData._id}`).hasClass('active')) {
      $(`#${annotationData._id}`).addClass('active');
    }
  });

  useEffect(() => {
    if (expanded || hovered) {
      AddClassActive(annotationData._id);
    } else {
      RemoveClassActive(annotationData._id);
    }
  }, [expanded, hovered]);

  return (
    <>
      <Card
        id={annotationData._id}
        onClick={() => { setUpdateFocusOfAnnotation(true); }}
        onMouseOver={() => { setHovered(true); }}
        onMouseOut={() => { setHovered(); }}
        className={`annotation-card-container ${annotationData.new ? 'new-annotation' : ''} ${expanded ? 'expanded' : ''} ${expanded || hovered ? 'active' : ''}`}
        style={side === 'left' ? { left: '50px' } : { right: '50px' }}
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
            {annotationData.editing
              ? (
                <>
                  <Form>
                    <Row>
                      <Col lg={12}>
                        <ButtonGroup size="sm" style={{ margin: '0.3rem 0.3rem 0px 0.3rem', width: 'calc(100% - 0.6rem)' }}>
                          <Button
                            onClick={() => { handleAnnotationPermissionsChange(0); }}
                            // eslint-disable-next-line no-nested-ternary
                            variant={showPermissionNumber() === 0 ? 'primary' : 'outline-primary'}
                            style={{ fontSize: 9, maxWidth: 100 }}
                          >
                            Private
                          </Button>
                          <OverlayTrigger
                            trigger="click"
                            key="bottom"
                            placement="bottom"
                            overlay={(
                              <Popover id="popover-share-annotation-options" className={showMoreInfoShareModal ? 'z-index-1' : ''}>
                                <Popover.Title id="popover-share-annotation-header">
                                  <span>Share Annotation</span>
                                  <QuestionCircle
                                    style={{
                                      float: 'right', position: 'relative', top: 2, cursor: 'pointer',
                                    }}
                                    onClick={() => { setShowMoreInfoShareModal(true); }}
                                  />
                                </Popover.Title>
                                <Popover.Content id="popover-share-annotation-body">
                                  <Form>
                                    <Form.Check
                                      type="radio"
                                      label="with group(s)"
                                      id="radio-share-annotation-groups"
                                      onClick={() => { handleAnnotationPermissionsChange(1); }}
                                      checked={showPermissionNumber() === 1}
                                    />
                                    <Form.Check
                                      type="radio"
                                      label="with user(s)"
                                      id="radio-share-annotation-users"
                                      onClick={() => { handleAnnotationPermissionsChange(2); }}
                                      checked={showPermissionNumber() === 2}
                                    />
                                    <div id="typeahead-share-annotation-users-container" className={showPermissionNumber() === 2 ? 'show' : ''}>
                                      <Typeahead
                                        id="typeahead-share-annotation-users"
                                        labelKey="name"
                                        placeholder="search by user name or email"
                                        multiple
                                        renderToken={renderUserShareToken}
                                        renderMenu={renderUserShareMenu}
                                        selected={selectedUsersToShare}
                                        options={membersIntersection}
                                        allowNew
                                        onChange={setSelectedUsersToShare}
                                      />
                                    </div>
                                  </Form>
                                </Popover.Content>
                              </Popover>
                            )}
                          >
                            <Button style={{ fontSize: 9 }} variant={showPermissionNumber() === 0 ? 'outline-primary' : 'primary'}>
                              {permissionText[showPermissionNumber()]}
                            </Button>
                          </OverlayTrigger>
                        </ButtonGroup>
                      </Col>
                    </Row>
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
                        <Typeahead
                          id="typeahead-annotation-tags"
                          labelKey="tags"
                          placeholder="add some tags here..."
                          multiple
                          selected={newAnnotationTags === null ? annotationData.body.tags : newAnnotationTags}
                          options={allAnnotationTags}
                          renderToken={renderToken}
                          renderMenu={renderMenu}
                          allowNew
                          onChange={(selected) => {
                            setNewAnnotationTags(selected.filter((s) => (typeof (s) !== 'object' || !s.alreadyExists)));
                          }}
                        />
                      </ListGroup.Item>
                    </ListGroup>
                  </Form>
                </>
              )
              : (
                <>
                  <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                    <ListGroup.Item className="annotation-body" onClick={() => { setExpanded(); setUpdateFocusOfAnnotation(true); }}>
                      {annotationData.body.value.length > 0 ? annotationData.body.value : (
                        <>
                          <span className="text-quote">
                            <img
                              className="quote-svg"
                              src="/quote-left-svg.svg"
                              alt="quote left"
                            />
                            {annotationData.target.selector.exact}
                          </span>
                        </>
                      )}
                    </ListGroup.Item>
                    {annotationData.body.tags.length > 0 ? (
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
            <Card.Header className="annotation-header grey-background">
              <span className="float-left">{annotationData.creator.name}</span>
              {annotationData.editing ? (
                <>
                  {annotationData.new ? (
                    <TrashFill
                      className="btn-cancel-annotation-edits float-right"
                      size="1em"
                      variant="secondary"
                      onClick={CancelAnnotation}
                    />
                  ) : (
                    <Button
                      className="btn-cancel float-right"
                      variant="secondary"
                      size="sm"
                      onClick={CancelAnnotation}
                    >
                      Cancel
                    </Button>
                  )}

                  {newAnnotationTags === null && newAnnotationPermissions === null && newAnnotationText === null ? ''
                    : (
                      <Button size="sm" className="btn-save-annotation-edits float-right" variant="primary" onClick={SaveAnnotation}>
                        Save
                      </Button>
                    )}
                </>
              ) : (
                <>

                  <span className="float-right">

                    <span>{annotationData.modified === undefined ? '' : moment(annotationData.modified.toString()).format('MM/DD/YYYY')}</span>
                    {user.email === annotationData.creator.email && !annotationData.new ? (
                      <Dropdown className="annotation-more-options-dropdown">
                        <Dropdown.Toggle variant="light" id="dropdown-basic">
                          <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" className="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                          </svg>
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="annotation-more-options-dropdown-menu">
                          <Dropdown.Item href="#/action-1" onClick={() => { annotationData.editing = true; SetAndSaveAnnotationData(annotationData); setUpdateFocusOfAnnotation(true); }}>Edit</Dropdown.Item>
                          <Dropdown.Item href="#/action-2" onClick={DeleteAnnotation}>Delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    ) : ''}

                  </span>

                </>
              )}
            </Card.Header>
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
                <div className="truncated-annotation">
                  {annotationData.body.value.length === 0 ? (
                    <span className="text-quote">
                      <img
                        className="quote-svg"
                        src="/quote-left-svg.svg"
                        alt="quote left"
                      />
                      {annotationData.target.selector.exact}
                    </span>
                  ) : annotationData.body.value}
                </div>
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

        .tag-already-exists {
          font-size: 9px;
        }

        .user-share-email {
          font-size: 9px;
        }

        #popover-share-annotation-options.z-index-1 {
          z-index: 1;
        }

        #typeahead-share-annotation-users {
          width: 100%;
        }

        #typeahead-share-annotation-users-container {
          margin-left: 20px;
          width: calc(100% - 40px);
          display: none;
        }

        #typeahead-share-annotation-users-container .rbt-input-main {
          font-size: 15px;
          line-height: 25px;
        }

        #typeahead-share-annotation-users-container.show {
          display: block;
        }

        #typeahead-share-annotation-users-container .rbt-input {
          padding: 3px 3px 2px 3px;
        }

        .annotation-tag-token {
          font-size: 14px;
        }

        #popover-share-annotation-header {
          font-size: 14px;
        }

        #popover-share-annotation-body {
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
          color: #616161;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }

        .annotation-pointer-background-left, .annotation-pointer-left, .annotation-pointer-background-right, .annotation-pointer-right {
          visibility: hidden;
        }

        .active .annotation-pointer-background-left, .active .annotation-pointer-left, .active .annotation-pointer-background-right, .active .annotation-pointer-right {
          visibility: visible;
        }

        .active .line1, .active .line2, .active .line1, .active .line2 {
          visibility: visible;
        }

        .line1, .line2 {
            visibility: hidden;
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
            background-color: rgba(255, 194, 10, 0.5);
            z-index: 3;
        }

        .annotation-card-container.active .annotation-pointer-background-left {
            border-left-color: rgba(255, 194, 10, 0.5);
        }

        .annotation-card-container.active .annotation-pointer-background-right {
            border-right-color: rgba(255, 194, 10, 0.5);
        }

        .annotation-card-container .form-group {
            margin-bottom: 0px;
        }

        .annotation-card-container {
            position: absolute;
            cursor: pointer;
            border: 1px solid rgb(220, 220, 220);
            border-radius: 0px;
            width: calc(100% - 50px);
            transition: border-color 0.5s;
            transition: top 0.5s;
        }

        .annotation-card-container.active {
            border: 1px solid rgba(255, 194, 10, 0.5);
        }

        .btn-save-annotation-edits {
          margin-right: 3px;
          font-size: 9px;
        }

        .btn-cancel {
          font-size: 9px;
        }


        .btn-cancel-annotation-edits {
          font-size: 18px;
          border-radius: 50%;
          line-height: 6.5px;
          padding-left: 2.5px;
          width: 18px;
          height: 18px;
          padding-top: 2.3px;
          background-color: transparent;
          color: #6c757d;
        }

        .annotation-more-options-dropdown-menu {
            font-size: 12px;
        }

        #text-share-annotation {
            font-size: 12px;
            top: -2px;
            position: relative;
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
      }

      .grey-background {
        background-color: rgb(250,250,250)
      }

      .annotation-body {
        padding: 0.30rem 0.3rem !important;
        font-size: 12px;
        border-bottom-width: 0px
      }

      .annotation-tags {
        padding: 0.30rem 0.30rem !important;
        font-size: 16px;
        font-weight: 500 !important;
        border-bottom-width: 1px !important
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
