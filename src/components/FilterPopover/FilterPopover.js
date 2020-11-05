/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React, { useState, useEffect } from 'react';
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

import { Filter } from 'react-bootstrap-icons';

import {
  Typeahead, Menu, MenuItem, Token,
} from 'react-bootstrap-typeahead';
// Import as a module in your JS
import 'react-bootstrap-typeahead/css/Typeahead.css';

function ByPermissionsFilterMatch(user_email, email, permissions, cf) { // AND FUNCTION
  if (cf.permissions === 0 && user_email === email) { // mine
    return true;
  }

  if (cf.permissions === 1 && !permissions.private) { // shared
    return true;
  }

  if (cf.permissions === 2) { // shared with owner

  }
}

function AnnotatedByFilterMatch(email, cf) { // AND FUNCTION
  return cf.annotatedBy.length === 0 ? true : cf.annotatedBy.includes(email);
}

function ByTagFilterMatch(tags, cf) { // OR FUNCTION
  if (cf.byTags.length === 0) {
    return true;
  }

  for (let i = 0; i < tags.length; i += 1) {
    if (cf.byTags.includes(tags[i])) {
      return true;
    }
  }
  return false;
}

const AnnotationMatchesFilters = (user_email, a, filters) => AnnotatedByFilterMatch(a.creator.email, filters)
&& ByTagFilterMatch(a.tags, filters)
&& ByPermissionsFilterMatch(user_email, a.creator.email, a.permissions, filters);

const FilterAnnotations = (user_email, annotations, filters) => {
  const annotationIds = { left: [], right: [] };

  for (const side in annotationIds) {
    if (Array.isArray(annotations[side])) {
      for (const a of annotations[side]) {
        if (AnnotationMatchesFilters(user_email, a, filters)) {
          annotationIds[side].push(annotations[side]._id);
        }
      }
    }
  }

  return annotationIds;
};


const GenerateFilterOptions = (user_email, annotations, filters) => {
  // this function takes in a list of annotations and returns an object of all the filter options that are available for this list of annotations and how many matches each option has with the current filtres applied
  const filterOptions = {
    annotatedBy: [],
    byTags: [],
  };

  let index; let
    annotationMatches;
  // eslint-disable-next-line guard-for-in
  for (const side in annotations) {
    if (Array.isArray(annotations[side])) {
      for (const a of annotations[side]) {
        // first we will add this annotations annotatedBy filterOption
        index = filterOptions.annotatedBy.findIndex((opt) => opt.email === a.creator.email);
        annotationMatches = AnnotationMatchesFilters(user_email, a, filters);
        if (index === -1) {
          filterOptions.annotatedBy.push({ name: a.creator.name, email: a.creator.email, matches: annotationMatches ? 1 : 0 });
        } else {
          filterOptions.annotatedBy[index].matches += annotationMatches ? 1 : 0;
        }


        // second we will add this annotations byTags filterOption
        const newTags = a.body.tags.filter((tag) => filterOptions.byTags.findIndex((opt) => opt.name === tag) === -1);
        // take these new tags and map them into an object and add them to the existing list of byTags array
        for (const tag of newTags) {
          filterOptions.byTags.push({ name: tag, matches: 1 });
        }
      }
    }
  }

  return filterOptions;
};


function FilterPopover({ session, annotations }) {
  const [byTagsTypeheadMarginTop, setByTagsTypeheadMarginTop] = useState(0);
  const [byTagsTypeheadMarginBottom, setByTagsTypeheadMarginBottom] = useState(0);

  const [filtersApplied, setFiltersApplied] = useState(1);// 0 means no filters applied, 1 means filters applied, 2 means loading

  const [selectedPermissions, setSelectedPermissions] = useState(0);

  const [filters, setFilters] = useState({
    annotatedBy: [], // list of filter options that have been selected by user
    byTags: [], // list of filter options that have been selected by user
  });

  const g = GenerateFilterOptions(session.user.email, annotations, {
    annotatedBy: filters.annotatedBy.map((opt) => opt.email),
    byTags: filters.byTags.map((opt) => opt.name),
    permissions: selectedPermissions,
  });

  console.log('g', g);

  const [filterOptions, setFilterOptions] = useState({ annotatedBy: [], byTags: [] });

  useEffect(() => {
    setFilterOptions(g);
  }, [annotations]);


  const updateFilters = (type, selected) => {
    filters[type] = selected;
    const annotationIds = FilterAnnotations(session.user.email, annotations, {
      annotatedBy: filters.annotatedBy.map((opt) => opt.email),
      byTags: filters.byTags.map((opt) => opt.name),
      permissions: selectedPermissions,
    });
    console.log('annotationIds', annotationIds);
    setFilters(filters);
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
  return (
    <>
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
                  <Card.Subtitle className="mb-2 text-muted">
                    <ButtonGroup size="sm" aria-label="Basic example">
                      <Button
                        variant={selectedPermissions === 0 ? 'primary' : 'outline-primary'}
                        onClick={() => { setSelectedPermissions(0); }}
                      >
                        Mine
                      </Button>
                      <Button
                        variant={selectedPermissions === 1 ? 'primary' : 'outline-primary'}
                        onClick={() => { setSelectedPermissions(1); }}
                      >
                        Shared
                      </Button>
                      <Button
                        variant={selectedPermissions === 2 ? 'primary' : 'outline-primary'}
                        onClick={() => { setSelectedPermissions(2); }}
                      >
                        Shared With Owner
                      </Button>
                    </ButtonGroup>
                  </Card.Subtitle>
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
                          placeholder="Choose several users"
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
                          placeholder="Choose several tags"
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
          variant={filtersApplied === 0 ? 'outline-primary' : 'outline-success'}

        >
          <Filter size="1em" />
          {filtersApplied === 0 && <span>Filter</span>}
          {filtersApplied === 1 && <span>Filters Applied</span>}
          {filtersApplied === 2 && (
          <>
            <span>Filtering</span>
            <Spinner
              animation="border"
              style={{
                color: 'inherit !important', width: '1rem', height: '1rem', marginLeft: '5px',
              }}
            />
          </>
          )}
        </Button>
      </OverlayTrigger>

      <style jsx global>
        {`
        
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
