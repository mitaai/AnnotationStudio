/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React, { useState, useContext, useEffect } from 'react';
import $ from 'jquery';
import {
  Nav,
  Row,
  Col,
  Navbar,
  Breadcrumb,
  Container,
  Button,
  OverlayTrigger,
  Popover,
  Form,
  Card,
  ButtonGroup,
  Badge,
  Spinner,
} from 'react-bootstrap';

import { Filter, FileEarmarkLock2, FileEarmarkPerson, FileEarmarkFill } from 'react-bootstrap-icons';

import {
  Typeahead, Menu, MenuItem, Token,
} from 'react-bootstrap-typeahead';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { DocumentContext, DocumentFiltersContext, DocumentAnnotationsContext } from '../../contexts/DocumentContext';


function FilterPopover({ session }) {
  const document = useContext(DocumentContext);
  const [channelAnnotations] = useContext(DocumentAnnotationsContext);
  const [documentFilters, setDocumentFilters] = useContext(DocumentFiltersContext);
  const [byTagsTypeheadMarginTop, setByTagsTypeheadMarginTop] = useState(0);
  const [byTagsTypeheadMarginBottom, setByTagsTypeheadMarginBottom] = useState(0);


  function ByPermissionsFilterMatch(user_email, email, permissions, cf, userId) { // AND FUNCTION
    if (cf.permissions === 0 && user_email === email) { // mine
      return true;
    }

    if (cf.permissions === 1 && !permissions.private && !permissions.sharedTo) { // shared
      return true;
    }

    if (cf.permissions === 2 && permissions.sharedTo !== undefined) { // shared with specific people
      return permissions.sharedTo.includes(userId);
    }
  }

  function AnnotatedByFilterMatch(email, cf) { // AND FUNCTION
    return cf.annotatedBy.length === 0 ? true : cf.annotatedBy.includes(email);
  }

  function ByTagFilterMatch(tags, cf) { // OR FUNCTION
    if (cf.byTags.length === 0) {
      return true;
    }

    if (tags === undefined) {
      return false;
    }

    for (let i = 0; i < tags.length; i += 1) {
      if (cf.byTags.includes(tags[i])) {
        return true;
      }
    }
    return false;
  }

  function DeepCopyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  const AnnotationMatchesFilters = (user_email, a, filters, userId) => AnnotatedByFilterMatch(a.creator.email, filters) && ByTagFilterMatch(a.body.tags, filters) && ByPermissionsFilterMatch(user_email, a.creator.email, a.permissions, filters, userId);

  const FilterAnnotations = (user_email, annotations, filters, userId) => {
    const annotationIds = { left: [], right: [] };
    for (const side in annotationIds) {
      if (Array.isArray(annotations[side])) {
        for (const a of annotations[side]) {
          if (AnnotationMatchesFilters(user_email, a, filters, userId)) {
            annotationIds[side].push(a._id);
          }
        }
      }
    }

    return annotationIds;
  };

  // OR filter
  const GetNumberOfMatchesForThisEmail = (user_email, annotations, currentFilters, filterEmail, userId) => {
    const f = Object.assign(DeepCopyObj(currentFilters), { annotatedBy: [filterEmail] });
    const ids = FilterAnnotations(user_email, annotations, f, userId);
    return ids.left.length + ids.right.length;
  };

  // OR filter
  const GetNumberOfMatchesForThisTag = (user_email, annotations, currentFilters, filterTag, userId) => {
    const f = Object.assign(DeepCopyObj(currentFilters), { byTags: [filterTag] });
    const ids = FilterAnnotations(user_email, annotations, f, userId);
    return ids.left.length + ids.right.length;
  };

  const GetNumberOfMatchesForThisTagAndOperator = (user_email, annotations, currentFilters, filterTag, userId) => {
    const f = DeepCopyObj(currentFilters);
    f.byTags.push(filterTag);
    const ids = FilterAnnotations(user_email, annotations, f, userId);
    return ids.left.length + ids.right.length;
  };

  const GenerateFilterOptions = (user_email, annotations, filters, filteredAnnotationIds) => {
    // this function takes in a list of annotations and returns an object of all the filter options that are available for this list of annotations and how many matches each option has with the current filtres applied
    const filterOptions = {
      annotatedBy: [],
      byTags: [],
    };

    let index;
    // eslint-disable-next-line guard-for-in
    for (const side in annotations) {
      if (Array.isArray(annotations[side])) {
        for (const a of annotations[side]) {
          // first we will add this annotations annotatedBy filterOption
          index = filterOptions.annotatedBy.findIndex((opt) => opt.email === a.creator.email);
          if (index === -1) {
            // if the permissions is either shared or shared with only me your own name shouldn't show in the dropdown because you can't share an annotation with your self
            if (filters.permissions !== 2 || user_email !== a.creator.email) {
              filterOptions.annotatedBy.push({
                id: a.creator.email,
                name: FirstNameLastInitial(a.creator.name),
                email: a.creator.email,
                matches: GetNumberOfMatchesForThisEmail(user_email, annotations, filters, a.creator.email, session.user.id),
              });
            }
          }


          // second we will add this annotations byTags filterOption
          const uniqueBodyTags = a.body.tags.filter(onlyUnique);
          const newTags = uniqueBodyTags.filter((tag) => filterOptions.byTags.findIndex((opt) => opt.name === tag) === -1);
          // take these new tags and map them into an object and add them to the existing list of byTags array
          for (const tag of newTags) {
            filterOptions.byTags.push({
              id: tag,
              name: tag,
              matches: GetNumberOfMatchesForThisTag(user_email, annotations, filters, tag, session.user.id),
            });
          }
        }
      }
    }

    return filterOptions;
  };


  const filterOptions = GenerateFilterOptions(session.user.email, channelAnnotations, {
    annotatedBy: documentFilters.filters.annotatedBy.map((opt) => opt.email),
    byTags: documentFilters.filters.byTags.map((opt) => opt.name),
    permissions: documentFilters.filters.permissions,
  }, documentFilters.annotationIds);

  const UpdateSelectedTokensMatchesValue = (type, selected) => selected.map((s) => {
    const obj = filterOptions[type].find((opt) => opt.id === s.id);
    return Object.assign(s, { matches: obj === undefined ? 0 : obj.matches });
  });

  const FilterOnInit = () => {
    const annotationIds = FilterAnnotations(session.user.email, channelAnnotations, {
      annotatedBy: documentFilters.filters.annotatedBy.map((opt) => opt.email),
      byTags: documentFilters.filters.byTags.map((opt) => opt.name),
      permissions: documentFilters.filters.permissions,
    }, session.user.id);
    setDocumentFilters({ annotationIds, filters: documentFilters.filters, annotationsLoaded: documentFilters.annotationsLoaded });
  };

  useEffect(() => {
    if (documentFilters.filterOnInit && documentFilters.annotationsLoaded) {
      FilterOnInit();
    }
  });

  const updateFilters = (type, selected) => {
    documentFilters.filters[type] = selected;

    const annotationIds = FilterAnnotations(session.user.email, channelAnnotations, {
      annotatedBy: documentFilters.filters.annotatedBy.map((opt) => opt.email),
      byTags: documentFilters.filters.byTags.map((opt) => opt.name),
      permissions: documentFilters.filters.permissions,
    }, session.user.id);

    setDocumentFilters({ annotationIds, filters: documentFilters.filters });
  };

  const renderMenu = (results, menuProps) => (
    <Menu
      {...menuProps}
    >
      {results.map((result, index) => (
        <MenuItem option={result} key={index} position={index} disabled={result.matches === 0}>
          <span>{result.name}</span>
          <span style={{ float: 'right' }}>{result.matches}</span>

        </MenuItem>
      ))}
    </Menu>
  );

  const renderToken = (option, { onRemove }, index) => (
    <Token
      key={index}
      onRemove={onRemove}
      option={option}
      className={option.matches === 0 ? 'no-matches-token' : ''}
    >
      <span>{option.name}</span>
      <span className="token-badge">{option.matches}</span>
    </Token>
  );

  console.log('documentFilters', documentFilters);

  return (
    <>
      <ButtonGroup size="sm" aria-label="Permissions" className="permissions-buttons">
        <Button
          variant={documentFilters.filters.permissions === 0 ? 'primary' : 'outline-primary'}
          onClick={() => { updateFilters('permissions', 0); }}
        >
          <FileEarmarkLock2 size="1.2em" />
          <div className="mine">Mine</div>
        </Button>
        <Button
          variant={documentFilters.filters.permissions === 1 ? 'primary' : 'outline-primary'}
          onClick={() => { updateFilters('permissions', 1); }}
        >
          <FileEarmarkFill size="1.2em" />
          <div className="shared-with-groups">Shared with group(s)</div>
        </Button>
        <Button
          variant={documentFilters.filters.permissions === 2 ? 'primary' : 'outline-primary'}
          onClick={() => { updateFilters('permissions', 2); }}
        >
          <FileEarmarkPerson size="1.2em" />
          <div className="shared-with-me">Shared with me</div>
        </Button>
      </ButtonGroup>
      <OverlayTrigger
        trigger="click"
        key="filter-popover"
        placement="bottom"
        rootClose
        overlay={(
          <Popover id="filter-popover">
            <Popover.Content>
              <Card>
                <Card.Body>
                  <Row>
                    <Col>
                      <Form.Group style={{ marginTop: '0px' }}>
                        <Form.Label>Annotated By</Form.Label>
                        <Typeahead
                          id="typehead-annotated-by"
                          labelKey="name"
                          renderMenu={renderMenu}
                          renderToken={renderToken}
                          multiple
                          clearButton
                          highlightOnlyResult
                          disabled={documentFilters.filters.permissions === 0}
                          selected={UpdateSelectedTokensMatchesValue('annotatedBy', DeepCopyObj(documentFilters.filters.annotatedBy))}
                          onChange={(selected) => { updateFilters('annotatedBy', selected); }}
                          onMenuToggle={(isOpen) => {
                            if (isOpen) {
                              setByTagsTypeheadMarginTop($('#typehead-annotated-by').height() + 10);
                            } else {
                              setByTagsTypeheadMarginTop(0);
                            }
                          }}
                          onInputChange={() => { setByTagsTypeheadMarginTop($('#typehead-annotated-by').height() + 10); }}
                          options={filterOptions.annotatedBy}
                          placeholder="Select one or more user(s)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <Form.Group style={{ marginTop: `${byTagsTypeheadMarginTop}px`, marginBottom: `${byTagsTypeheadMarginBottom}px` }}>
                        <Form.Label>By Tags</Form.Label>
                        <Typeahead
                          id="typehead-by-tags"
                          labelKey="name"
                          renderMenu={renderMenu}
                          renderToken={renderToken}
                          multiple
                          clearButton
                          highlightOnlyResult
                          selected={UpdateSelectedTokensMatchesValue('byTags', DeepCopyObj(documentFilters.filters.byTags))}
                          onChange={(selected) => { updateFilters('byTags', selected); }}
                          onMenuToggle={(isOpen) => {
                            if (isOpen) {
                              setByTagsTypeheadMarginBottom($('#typehead-by-tags').height() + 20);
                            } else {
                              setByTagsTypeheadMarginBottom(0);
                            }
                          }}
                          onInputChange={() => { setByTagsTypeheadMarginBottom($('#typehead-by-tags').height() + 20); }}
                          options={filterOptions.byTags}
                          placeholder="Select on or more tag(s)"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Popover.Content>
          </Popover>
                  )}
      >
        <Button
          id="btn-filter-annotation-well"
          size="sm"
          variant={documentFilters.filters.annotatedBy.length + documentFilters.filters.byTags.length > 0 ? 'primary' : 'outline-primary'}

        >
          <Filter size="1em" />
          <span>Filter</span>

        </Button>
      </OverlayTrigger>

      <style jsx global>
        {`

        .permissions-buttons {
          margin-top: 7px;
          margin-right: 7px;
        }

        .permissions-buttons .btn div {
          transition: width 0.5s, opacity 1s;
          overflow: hidden;
          padding-left: 9px;
          white-space: nowrap;
          opacity: 0;
        }

        .permissions-buttons .btn svg {
          position: absolute;
          top: 6px;
          left: 5px;
        }

        .permissions-buttons .btn {
          height: 31px;
        }

        .permissions-buttons .btn.btn-outline-primary div {
          width: 0px;
        }

        .permissions-buttons .btn.btn-primary div.mine {
          width: 60px;
          opacity: 1;
        }

        .permissions-buttons .btn.btn-primary div.shared-with-groups {
          width: 160px;
          opacity: 1;
        }

        .permissions-buttons .btn.btn-primary div.shared-with-me {
          width: 130px;
          opacity: 1;
        }
        
        #btn-filter-annotation-well {
          margin-top: 7px;
          float: right;
        }

        #btn-filter-annotation-well svg {
          margin-right: 5px;
          position: relative;
          top: -2px;
        }

        #filter-popover {
          max-width: 30vw;
          width: 30vw;
        }

        #filter-popover .card {
          border: none;
        }

        #filter-popover .form-label {
          font-weight: bold;
        }

        #filter-popover .popover-body {
          padding: 0px;
        }

        #filter-popover .filter-option-checkbox {
          margin-right: 4px;
        }

        #filter-popover .filter-option-name {
          position: relative;
          top: -2px;
          font-size: 14px;
        }

        #filter-popover .rbt-input-multi.form-control.rbt-input {
          padding: 6px;
        }

        .token-badge {
            position: relative;
            top: -1px;
            margin-left: 4px;
            font-size: 10px;
            border-radius: 5px;
            padding: 1px 2px;
            border: 1px solid #007bff;
        }

        .rbt-token-active .token-badge {
            border-color: white;
        }

        .no-matches-token {
            background-color: #eeeeee !important;
            color: #616161 !important;
        }

        .no-matches-token .token-badge {
            border-color: #616161 !important; 
        }
        
        `}
      </style>
    </>
  );
}

export default FilterPopover;
