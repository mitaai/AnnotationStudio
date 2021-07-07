/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-underscore-dangle */
import { useEffect, useState, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import ReactHtmlParser from 'react-html-parser';
import $ from 'jquery';
import moment from 'moment';
import {
  Card,
  Form,
  Button,
  Badge,
  Dropdown,
  ListGroup,
  OverlayTrigger,
  Tooltip,
  DropdownButton,
} from 'react-bootstrap';
import {
  TrashFill,
  QuestionCircle,
  PeopleFill,
  PersonFill,
  PersonPlusFill,
  PenFill,
} from 'react-bootstrap-icons';
import {
  Typeahead, Menu, MenuItem, Token,
} from 'react-bootstrap-typeahead';
import {
  postAnnotation,
  updateAnnotationById,
  deleteAnnotationById,
} from '../../utils/annotationUtil';
import {
  DocumentAnnotationsContext,
  DocumentFiltersContext,
  DocumentActiveAnnotationsContext,
} from '../../contexts/DocumentContext';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { fixIframes } from '../../utils/parseUtil';

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

function AnnotationCard({
  side,
  annotation,
  focusOnAnnotation,
  deleteAnnotationFromChannels,
  user,
  expanded,
  setShowMoreInfoShareModal,
  membersIntersection,
  setAlerts,
}) {
  const [activeAnnotations] = useContext(DocumentActiveAnnotationsContext);
  const [,,,
    expandAnnotation,
    saveAnnotationChanges,
    allAnnotationTags,
    annotationIdBeingEdited,
    setShowUnsavedChangesToast,
  ] = useContext(DocumentAnnotationsContext);
  const [
    documentFilters,
    setDocumentFilters,
    FilterAnnotations,
  ] = useContext(DocumentFiltersContext);

  const initPermissions = (n) => {
    const permissions = {};
    if (n === 0) {
      // user wants the annotation to be private
      permissions.private = true;
      permissions.sharedTo = undefined;
    } else if (n === 1) {
      // user wants the annotation to be shared with groups
      // groups intersection
      permissions.groups = user.groups
        .filter(({ id }) => (annotation.target.document.groups.includes(id)))
        .map(({ id }) => id);
      permissions.sharedTo = undefined;
      permissions.private = false;
    } else if (n === 2) {
      // user wants annotation to be shared with document owner only
      permissions.private = false;
      // when we first init permission there will be no specific users to share to
      permissions.sharedTo = [];
    }

    return permissions;
  };

  const [annotationData, setAnnotationData] = useState(annotation.new
    ? { ...annotation, permissions: initPermissions(documentFilters.filters.permissions) }
    : { ...annotation });
  const [newAnnotationTags, setNewAnnotationTags] = useState(null);
  const [newAnnotationPermissions, setNewAnnotationPermissions] = useState(null);
  const [newAnnotationText, setNewAnnotationText] = useState(annotation.editing !== undefined ? '' : null);
  const [cancelingAnnotation, setCancelingAnnotation] = useState(false);
  const [savingAnnotation, setSavingAnnotation] = useState(false);
  const [deletingAnnotation, setDeletingAnnotation] = useState(false);
  const [
    updateFocusOfAnnotation,
    setUpdateFocusOfAnnotation,
  ] = useState(annotation.editing);
  const [hovered, setHovered] = useState();
  const [lineHovered, setLineHovered] = useState();
  const [newSelectedUsersToShare, setNewSelectedUsersToShare] = useState(null);

  const leftRightPositionForAnnotation = annotationData.editing ? -10 : 15;

  let selectedUsersToShare = newSelectedUsersToShare;
  if (selectedUsersToShare === null) {
    selectedUsersToShare = annotationData.permissions.sharedTo === undefined
      ? []
      : annotationData.permissions.sharedTo
        .map((id) => membersIntersection.find((m) => m.id === id))
        .filter((v) => v !== undefined);
  }

  const permissionText = [
    (
      <>
        <PersonFill />
        {' '}
        Private
      </>
    ),
    (
      <>
        <PeopleFill />
        {' '}
        Shared with group(s)
      </>
    ),
    (
      <>
        <PersonPlusFill />
        {' '}
        {selectedUsersToShare.length === 1
          ? 'Shared with 1 user'
          : `Shared with ${selectedUsersToShare.length} users`}
      </>
    ),
  ];

  const setExpanded = (bool) => {
    expandAnnotation(annotationData._id, bool);
  };

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
    setDocumentFilters({ ...documentFilters, filterOnInit: true });
  }

  function SaveAnnotation() {
    if (savingAnnotation || cancelingAnnotation) {
      return;
    }
    setSavingAnnotation(true);
    setHovered();

    // reassign values to the annotationData
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
        newAnnotationData.permissions.private = true;
        newAnnotationData.permissions.sharedTo = undefined;
      } else if (newAnnotationPermissions === 1) {
        // user wants the annotation to be shared with groups
        // groups intersection
        newAnnotationData.permissions.groups = user.groups
          .filter(({ id }) => (newAnnotationData.target.document.groups.includes(id)))
          .map(({ id }) => id);
        newAnnotationData.permissions.sharedTo = undefined;
        newAnnotationData.permissions.private = false;
      } else if (newAnnotationPermissions === 2) {
        // user wants annotation to be shared with document owner only
        newAnnotationData.permissions.private = false;
        newAnnotationData.permissions.sharedTo = selectedUsersToShare.map(({ id }) => id);
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
        newAnnotationData.db_id = response.insertedId;
        newAnnotationData.modified = new Date();
        newAnnotationData.new = false;
        newAnnotationData.editing = false;
        $($(`#document-content-container span[annotation-id='${newAnnotationData._id}']`).get(-1))
          .prepend("<span class='annotation-ending-marker'></span>");
        const annotationEnding = $(`#document-content-container span[annotation-id='${annotation._id}'] .annotation-ending-marker`);
        newAnnotationData.position.height = (
          annotationEnding.offset().top - newAnnotationData.position.top
        ) + 18;
        setSavingAnnotation(false);
        // after setting the annotation data we need to reset the "new" data back to null
        setNewAnnotationTags(null);
        setNewAnnotationPermissions(null);
        setNewAnnotationText(null);
        setNewSelectedUsersToShare(null);
        // after saved annotation, highlighted text needs to change its class
        $('.text-currently-being-annotated.active').addClass('annotation-highlighted-text');
        $('.text-currently-being-annotated.active').removeClass('text-currently-being-annotated active');
        addHoverEventListenersToAllHighlightedText();
        // save this new data to the "#document-container" dom element attribute 'annotations'
        // and make the document selectable again
        $('#document-content-container').removeClass('unselectable');
        // once the new annotation data saves properly on the database,
        // expanding annotation when it is done saving
        setExpanded(true);
        AddClassActive(newAnnotationData._id);
        // update the annotation data
        SetAndSaveAnnotationData(newAnnotationData);
        // focus annotation so that things get shifted to their correct spots
        setUpdateFocusOfAnnotation(true);
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        setSavingAnnotation(false);
      });
    } else {
      updateAnnotationById(
        newAnnotationData.db_id === undefined ? newAnnotationData._id : newAnnotationData.db_id,
        newAnnotationData,
      ).then(() => {
        newAnnotationData.modified = new Date();
        newAnnotationData.editing = false;
        newAnnotationData.new = false;
        setSavingAnnotation(false);
        // once the new annotation data saves properly
        // on the database then we can update the annotation data
        SetAndSaveAnnotationData(newAnnotationData);

        // after setting the annotation data we need
        // to reset the "new" data back to null
        setNewAnnotationTags(null);
        setNewAnnotationPermissions(null);
        setNewAnnotationText(null);
        setNewSelectedUsersToShare(null);
        // then after everything is done we will focus
        // on the annotation so that things get shifted to their correct spots
        setUpdateFocusOfAnnotation(true);
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        setSavingAnnotation(false);
      });
    }
  }

  function CancelAnnotation() {
    if (cancelingAnnotation || savingAnnotation) {
      return;
    }

    if (annotationData.new) {
      setCancelingAnnotation(true);
      // if it is a new annotation then cancel should delete the annotation
      // after we remove the annotation we need to remove the classes from
      // the text that was highlighted and then make the document selectable again
      $('.text-currently-being-annotated.active').removeClass('text-currently-being-annotated active');
      // we also need to make the document selectable again
      $('#document-content-container').removeClass('unselectable');
      // we need to delete this annotation from the channel it is in
      deleteAnnotationFromChannels(side, annotationData._id);
    } else {
      setNewAnnotationTags(null);
      setNewAnnotationPermissions(null);
      setNewAnnotationText(null);
      // if the annotation is not new then canceling
      // should just return it to its previous state
      annotationData.editing = false;
      SetAndSaveAnnotationData(annotationData);
      setUpdateFocusOfAnnotation(true);
    }
  }

  function DeleteAnnotation() {
    if (deletingAnnotation || savingAnnotation) { return; }
    setDeletingAnnotation(true);
    deleteAnnotationById(annotationData.db_id === undefined
      ? annotationData._id : annotationData.db_id)
      .then(() => {
        // now that it is removed from db, remove any highlighted text related to the annotation
        // to remove it from the object that is keeping track of all the annotations
        $(`[annotation-id='${annotationData._id}']`).removeClass('annotation-highlighted-text');
        // we need to delete this annotation from the channel it is in
        deleteAnnotationFromChannels(side, annotationData._id);
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
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
    const style = {
      ...menuProps.style,
      width: menuProps.style.width - 15,
      opacity: 0.95,
      boxShadow: '1px 1px 2px 2px rgba(0,0,0,0.08)',
    };

    const res = results.map((r) => {
      if (typeof (r) === 'object') {
        return {
          ...r,
          alreadyExists: newAnnotationTags !== null ? newAnnotationTags.some((t) => r.tags === (typeof t === 'object' ? t.tags : t)) : annotationData.body.tags.some((t) => r.tags === t),
        };
      }
      return r;
    });

    return (
      <Menu
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...menuProps}
        style={style}
      >
        <div className="menu-header">Tag search results</div>
        {res.length === 0 && <div className="menu-no-results">no results</div>}
        {res.sort((a) => (typeof (a) === 'object' && a.customOption ? -1 : 0)).map((result, index) => {
          const tagDiv = typeof (result) === 'object' ? (
            <>
              <div className="tag-name">
                <span>{result.customOption && !result.alreadyExists && <b>new tag: </b>}</span>
                <span>{result.tags}</span>
              </div>
              {result.alreadyExists && <div className="tag-already-exists">already used</div>}
            </>
          ) : <div className="tag-name">{result}</div>;
          return (
            <MenuItem
              option={result}
              key={typeof (result) === 'object' ? result.tags : result}
              position={index}
            >
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

  const renderUserShareMenu = (results, menuProps) => {
    const sortedResults = results.sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() === b.name.toLowerCase()) {
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      }
      return 1;
    });
    return (
      <Menu
      // eslint-disable-next-line react/jsx-props-no-spreading
        {...menuProps}
      >
        {sortedResults.map((result, index) => (
          <MenuItem option={result} key={result.email} position={index}>
            <div className="user-share-name">{result.name}</div>
            <div className="user-share-email">{result.email}</div>
          </MenuItem>
        ))}
      </Menu>
    );
  };

  const handleAnnotationTextChange = (content) => {
    setNewAnnotationText(content);
  };

  function showPermissionNumber() {
    let i = 0;
    if (newAnnotationPermissions !== null) {
      i = newAnnotationPermissions;
    } else if (annotationData.permissions.private) {
      // private
      i = 0;
    } else if (!annotationData.permissions.sharedTo && !annotationData.permissions.private) {
      // shared with groups
      i = 1;
    } else if (annotationData.permissions.sharedTo !== undefined) {
      // shared to
      i = 2;
    }

    return i;
  }

  function handleAnnotationPermissionsChange(num) {
    const previousPermission = showPermissionNumber();
    setNewAnnotationPermissions(num);
    if (previousPermission === 2 || num === 2) {
      setUpdateFocusOfAnnotation(true);
    }
  }

  const annotationMatchesCurrentFilters = () => {
    const newPermissions = { ...annotationData.permissions };
    if (newAnnotationPermissions !== null) {
      if (newAnnotationPermissions === 0) {
        // user wants the annotation to be private
        newPermissions.private = true;
        newPermissions.sharedTo = undefined;
      } else if (newAnnotationPermissions === 1) {
        // user wants the annotation to be shared with groups
        // groups intersection
        newPermissions.groups = user.groups
          .filter(({ id }) => (annotationData.target.document.groups.includes(id)))
          .map(({ id }) => id);
        newPermissions.sharedTo = undefined;
        newPermissions.private = false;
      } else if (newAnnotationPermissions === 2) {
        // user wants annotation to be shared with document owner only
        newPermissions.private = false;
        newPermissions.sharedTo = selectedUsersToShare.map(({ id }) => id);
      }
    }
    const channelAnnos = { left: [], right: [] };
    channelAnnos[side] = [{ ...annotationData, permissions: { ...newPermissions } }];
    const ids = FilterAnnotations(channelAnnos, {
      annotatedBy: documentFilters.filters.annotatedBy.map((opt) => opt.email),
      byTags: documentFilters.filters.byTags.map((opt) => opt.name),
      permissions: documentFilters.filters.permissions,
    });
    return ids[side].length > 0;
  };

  const saveButton = (
    <Button
      size="sm"
      className="btn-save-annotation-edits"
      variant="primary"
      onClick={SaveAnnotation}
    >
      Save
    </Button>
  );

  const annotationSaveButton = annotationMatchesCurrentFilters() ? saveButton : (
    <OverlayTrigger
      overlay={(
        <Tooltip className="styled-tooltip">
          <strong>Note:</strong>
          {' '}
          Filters applied to this document may exclude
          this annotation. It will be saved, but filters must be
          adjusted to display it.
        </Tooltip>
      )}
    >
      {saveButton}
    </OverlayTrigger>
  );

  const innerLine = <div className="inner-line" style={{ width: lineHovered ? 3 : 1, left: lineHovered ? 0 : 1 }} />;

  const expandedAndFocus = () => {
    if (!expanded) {
      setExpanded(true);
    }
    setUpdateFocusOfAnnotation(true);
  };

  useEffect(() => {
    if (updateFocusOfAnnotation) {
      focusOnAnnotation();
      setUpdateFocusOfAnnotation();
    }
  }, [updateFocusOfAnnotation]);

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
        onMouseOver={() => { setHovered(true); }}
        onMouseOut={() => { setHovered(); }}
        className={`annotation-card-container ${side === 'left' ? 'left-annotation' : 'right-annotation'} ${annotationData.new ? 'new-annotation' : ''} ${expanded ? 'expanded' : ''} ${expanded || hovered || activeAnnotations.annotations.includes(annotationData._id) ? 'active' : ''} ${annotationData.editing ? 'editing' : ''}`}
        style={side === 'left' ? { right: leftRightPositionForAnnotation } : { left: leftRightPositionForAnnotation }}
      >
        <div
          className="line1"
          style={{ zIndex: -1 }}
          onClick={expandedAndFocus}
          onMouseOver={() => { setLineHovered(true); }}
          onMouseOut={() => { setLineHovered(); }}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          {innerLine}
        </div>
        <div
          className="line2"
          style={{ zIndex: -1 }}
          onClick={expandedAndFocus}
          onMouseOver={() => { setLineHovered(true); }}
          onMouseOut={() => { setLineHovered(); }}
          onFocus={() => {}}
          onBlur={() => {}}
        >
          {innerLine}
        </div>
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
                  <ListGroup variant="flush" style={{ borderTop: 'none', zIndex: 1, position: 'relative' }}>
                    <ListGroup.Item className="annotation-body">
                      <Form.Group controlId="exampleForm.ControlTextarea1">
                        <Form.Control
                          style={{ fontSize: '12px' }}
                          as={Editor}
                          rows="3"
                          placeholder="comments"
                          initialValue={annotationData.body.value}
                          onEditorChange={handleAnnotationTextChange}
                          readOnly={savingAnnotation}
                          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                          init={{
                            height: 200,
                            menubar: false,
                            plugins: [
                              'autolink link image media paste',
                            ],
                            paste_as_text: true,
                            toolbar:
                                'bold italic underline | link image media | removeformat | undo redo',
                            statusbar: false,
                            content_style: 'body { font-size: 12px; margin-left: 5px; margin-right: 5px; margin-top: 5px; } p { margin-top: 0; } iframe, img { max-width: 100%; }',
                            icons: 'small',
                            skin: 'small',
                            image_dimensions: false,
                            media_dimensions: false,
                            extended_valid_elements: 'img[class|src|border=0|alt|title|onmouseover|onmouseout|name],iframe[align<bottom?left?middle?right?top|class|frameborder|id|longdesc|name|scrolling<auto?no?yes|src|style|title]',
                          }}
                        />
                      </Form.Group>
                    </ListGroup.Item>
                    <ListGroup.Item className="annotation-tags">
                      <Typeahead
                        id="typeahead-annotation-tags"
                        disabled={savingAnnotation}
                        labelKey="tags"
                        placeholder="tags"
                        multiple
                        selected={
                            newAnnotationTags === null
                              ? annotationData.body.tags
                              : newAnnotationTags
                          }
                        options={allAnnotationTags}
                        renderToken={renderToken}
                        renderMenu={renderMenu}
                        allowNew
                        onChange={(selected) => {
                          setNewAnnotationTags(
                            selected.filter((s) => (typeof (s) !== 'object' || !s.alreadyExists)),
                          );
                        }}
                      />
                    </ListGroup.Item>
                    <ListGroup.Item className="annotation-permissions">
                      <div id="dropdown-permission-options-container">
                        <DropdownButton drop="down" variant="outline-primary" id="dropdown-permission-options" title={permissionText[showPermissionNumber()]} disabled={savingAnnotation}>
                          <Dropdown.Item
                            onClick={() => { handleAnnotationPermissionsChange(0); }}
                          >
                            <PersonFill />
                            {' '}
                            Private
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => { handleAnnotationPermissionsChange(1); }}
                          >
                            <PeopleFill />
                            {' '}
                            Share with group(s)
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => { handleAnnotationPermissionsChange(2); }}
                          >
                            <PersonPlusFill />
                            {' '}
                            Share with user(s)
                          </Dropdown.Item>
                        </DropdownButton>
                      </div>
                      <QuestionCircle id="question-circle-icon" onClick={() => { setShowMoreInfoShareModal(true); }} />
                      <div id="typeahead-share-annotation-users-container" className={showPermissionNumber() === 2 ? 'show' : ''}>
                        <Typeahead
                          id="typeahead-share-annotation-users"
                          disabled={savingAnnotation}
                          labelKey="name"
                          placeholder="search by user name or email"
                          multiple
                          highlightOnlyResult
                          renderToken={renderUserShareToken}
                          renderMenu={renderUserShareMenu}
                          selected={selectedUsersToShare}
                          options={membersIntersection}
                          onChange={(s) => {
                            if (newAnnotationPermissions === null) {
                              setNewAnnotationPermissions(showPermissionNumber);
                            }
                            setNewSelectedUsersToShare(s);
                          }}
                        />
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </>
              )
              : (
                <>
                  <ListGroup variant="flush" style={{ borderTop: 'none', zIndex: 1, position: 'relative' }}>
                    <ListGroup.Item className="annotation-body" onClick={() => { setExpanded(); }}>
                      {annotationData.body.value.length > 0
                        ? ReactHtmlParser(annotationData.body.value, { transform: fixIframes })
                        : (
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
                          {annotationData.body.tags.map((tag) => {
                            if (tag === '') { return ''; }
                            return <Badge key={tag} variant="secondary">{tag}</Badge>;
                          })}
                        </ListGroup.Item>
                      </>
                    ) : <></>}

                  </ListGroup>
                </>
              )}
            <Card.Header
              className="annotation-header grey-background"
              style={{ display: 'flex', alignItems: 'center' }}
              onClick={() => { setUpdateFocusOfAnnotation(true); }}
            >
              <span>{FirstNameLastInitial(annotationData.creator.name)}</span>
              {annotationData.editing ? (
                <>
                  <span style={{ flex: 1 }} />
                  {annotationData.new ? (
                    <TrashFill
                      className="btn-cancel-annotation-edits"
                      size="1em"
                      variant="secondary"
                      onClick={CancelAnnotation}
                    />
                  ) : (
                    <Button
                      className="btn-cancel"
                      variant="secondary"
                      size="sm"
                      onClick={CancelAnnotation}
                    >
                      Cancel
                    </Button>
                  )}

                  {newAnnotationTags !== null
                  || newAnnotationPermissions !== null
                  || newAnnotationText !== null
                    ? (
                      annotationSaveButton
                    ) : null }
                </>
              ) : (
                <>
                  <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{
                      width: 3, height: 3, borderRadius: 1.5, background: '#616161', marginLeft: 10, marginRight: 10,
                    }}
                    />
                    <span>{annotationData.modified === undefined ? '' : moment(annotationData.modified.toString()).format('MM/DD/YYYY')}</span>
                  </span>
                  <span style={{ flex: 1 }} />
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    {user.email === annotationData.creator.email && !annotationData.new && (
                      <>
                        <span
                          className="edit-annotation-btn"
                          onClick={() => {
                            if (annotationIdBeingEdited !== undefined) {
                              setShowUnsavedChangesToast(true);
                            } else {
                              annotationData.editing = true;
                              SetAndSaveAnnotationData(annotationData);
                            }
                          }}
                        >
                          <PenFill
                            style={{ marginRight: 7 }}
                            size={14}
                          />
                        </span>
                        <TrashFill
                          className="delete-annotation-btn"
                          size={14}
                          onClick={DeleteAnnotation}
                        />
                      </>
                    )}
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
              onExited={() => { setHovered(); }}
              overlay={(
                <Tooltip id={`tooltip-${annotationData._id}`}>
                  {FirstNameLastInitial(annotationData.creator.name)}
                </Tooltip>
      )}
            >
              <Card.Header className="annotation-header" onClick={expandedAndFocus}>
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
                  ) : ReactHtmlParser(annotationData.body.value, { transform: fixIframes })}
                </div>
              </Card.Header>
            </OverlayTrigger>
          </>
        )}

      </Card>
      <style jsx global>
        {`
        .delete-annotation-btn, .edit-annotation-btn {
          color: #616161;
        }

        .delete-annotation-btn:hover {
          color: #AC4545;
        }

        .edit-annotation-btn:hover {
          color: #015999;
        }

        .truncated-annotation, .truncated-annotation .text-quote {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          display: -webkit-box;
          max-height: 20px;
        }

        .tag-already-exists {
          font-size: 9px;
        }

        .user-share-email {
          font-size: 9px;
        }

        .annotation-permissions {
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

        #popover-share-annotation-options.z-index-1 {
          z-index: 1;
        }

        .annotation-tags .rbt-input-main{
          font-size: 12px;
          line-height: 20px;
        }

        .annotation-tags .rbt-input {
          border-radius: 0px;
          border: none;
          padding-left: 5px;
        }

        #typeahead-share-annotation-users {
          width: 100%;
        }

        #typeahead-share-annotation-users-container {
          margin-top: 2px;
          display: none;
        }

        #typeahead-annotation-tags {
          padding: 0px;
        }

        #typeahead-annotation-tags .tag-name {
          font-size: 12px;
        }

        #typeahead-annotation-tags .menu-header {
          font-size: 12px;
          padding: 2px 4px;
          border-bottom: 1px solid #eeeeee;
          color: #424242;
        }

        #typeahead-annotation-tags .menu-no-results {
          text-align: center;
          font-size: 12px;
          color: #616161;
          padding: 4px 0px;
        }

        #typeahead-share-annotation-users-container .rbt-input-main {
          font-size: 12px;
          line-height: 20px;
        }

        #typeahead-share-annotation-users-container.show {
          display: block;
        }

        #typeahead-share-annotation-users-container .rbt-input {
          padding: 3px 0px 2px 0px;
          border: none;
          border-bottom: 1px solid #eeeeee;
          border-radius: 0px;
        }

        .annotation-tag-token, .annotation-share-token {
          font-size: 12px;
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
          color: #757575;
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

        .active .line1, .active .line2 {
          visibility: visible;
        }

        .annotation-header.card-header {
          border-bottom: none !important;
        }

        .annotation-card-container > .list-group {
          border-bottom: none !important;
        }

        .left-annotation .inner-line {
          /*top: 3px;*/
        }

        .line1, .line2 {
            visibility: hidden;
            position: absolute;
            width: 5px;
            margin-top:-1px;
            background-color: transparent;
            z-index: 2;
            transition: background-color 0.5s;
        }

        .line1 .inner-line, .line2 .inner-line {
          height: 100%;
          transition: all 0.25s;
          position: relative;
        }

        .annotation-card-container.active .line1 > div, .annotation-card-container.active .line2 > div {
            background-color: rgba(255, 165, 10, 0.5);
        }

        .annotation-card-container.active .line1, .annotation-card-container.active .line2 {
          z-index: 3;
        }

        .annotation-card-container.active .annotation-pointer-background-left {
            border-left-color: rgba(255, 165, 10, 0.5);
        }

        .annotation-card-container.active .annotation-pointer-background-right {
            border-right-color: rgba(255, 165, 10, 0.5);
        }

        .annotation-card-container .form-group {
            margin-bottom: 0px;
        }

        .annotation-card-container {
          position: absolute;
          cursor: pointer;
          border: 1px solid rgb(220, 220, 220);
          border-radius: 0px;
          width: calc(100% - 25px);
          transition: all 0.5s;
          transition-property: border-color, top, left, right;
          max-width: 375px;
        }

        .annotation-card-container.active {
          border-color: rgba(255, 165, 10, 0.5);
        }

        .btn-save-annotation-edits {
          margin-left: 3px;
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

        .annotation-more-options-dropdown svg {
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
            z-index: 1;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-left-color: white;
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
          border-right-color: white;
      }

      .annotation-header {
        padding: 6px;
        font-size: 12px;
        background: white;
      }

      .grey-background {
        background-color: rgb(250,250,250) !important;
      }

      .editing {
        z-index: 2 !important;
      }

      .editing .annotation-body {
        padding: 0px !important;
      }

      .editing .annotation-tags {
        padding: 0px !important;
      }

      .annotation-body {
        padding: 0.3rem;
        font-size: 12px;
        border-bottom-width: 1px !important;
      }

      .annotation-body textarea {
        border: none;
        border-radius: 0px;
        padding: 6px;
        min-height: 200px;
      }

      .annotation-body .tox.tox-tinymce {
        border: none;
      }

      .annotation-tags {
        padding: 0px 0.3rem 0.3rem 0.3rem !important; 
        font-size: 16px;
        font-weight: 500 !important;
        border-bottom-width: 1px !important
      }

      .annotation-tags  .rbt-input {
        border: none;
      }

      .annotation-tags .badge {
          margin-right: 3px;
      }

      .annotation-card-container p {
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

export default AnnotationCard;
