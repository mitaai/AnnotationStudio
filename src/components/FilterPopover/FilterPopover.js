/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React, {
  useState, useContext, useEffect,
} from 'react';
import $ from 'jquery';
import {
  Row,
  Col,
  Button,
  OverlayTrigger,
  Overlay,
  Popover,
  Form,
  Card,
  ButtonGroup,
  Badge,
} from 'react-bootstrap';

import {
  Filter,
  PeopleFill,
  PersonFill,
  PersonPlusFill,
} from 'react-bootstrap-icons';

import {
  Typeahead, Menu, MenuItem, Token,
} from 'react-bootstrap-typeahead';
import { FirstNameLastInitial } from '../../utils/nameUtil';
import { DocumentFiltersContext, DocumentAnnotationsContext } from '../../contexts/DocumentContext';


function FilterPopover({ session, container }) {
  const [
    channelAnnotations, , , , , ,
    annotationIdBeingEdited, , scrollToAnnotation,
  ] = useContext(DocumentAnnotationsContext);
  const [
    documentFilters,
    setDocumentFilters,
    FilterAnnotations,
  ] = useContext(DocumentFiltersContext);
  const [byTagsTypeheadMarginTop, setByTagsTypeheadMarginTop] = useState(0);
  const [byTagsTypeheadMarginBottom, setByTagsTypeheadMarginBottom] = useState(0);
  const [show, setShow] = useState(false);
  const [target, setTarget] = useState(null);

  const GetNumberOfMatchesForThisPermission = (permissions) => {
    const ids = FilterAnnotations(channelAnnotations, {
      annotatedBy: [],
      byTags: [],
      permissions,
    });
    return ids.left.length + ids.right.length;
  };


  const totalNumberOfFilteredAnnotations = (
    documentFilters.annotationIds.left === null
    || documentFilters.annotationIds.right === null
  )
    ? 0
    : documentFilters.annotationIds.left.length + documentFilters.annotationIds.right.length;
  const numberOfMatchesForPermissions = [
    GetNumberOfMatchesForThisPermission(0),
    GetNumberOfMatchesForThisPermission(1),
    GetNumberOfMatchesForThisPermission(2),
  ];
  const permissionTextMargin = 3;
  const badgeNumWidth = 7.25;
  const badgeInitWidth = 8.25 + permissionTextMargin;
  const widthOfPermissionsBtns = [
    40 + badgeInitWidth + badgeNumWidth * (numberOfMatchesForPermissions[0] > 0
      ? Math.floor(Math.log10(numberOfMatchesForPermissions[0]) + 1)
      : 1),
    145 + badgeInitWidth + badgeNumWidth * (numberOfMatchesForPermissions[1] > 0
      ? Math.floor(Math.log10(numberOfMatchesForPermissions[1]) + 1)
      : 1),
    115 + badgeInitWidth + badgeNumWidth * (numberOfMatchesForPermissions[2] > 0
      ? Math.floor(Math.log10(numberOfMatchesForPermissions[2]) + 1)
      : 1),
  ];
  const widthOfInactiveFilter = 70;
  const widthOfActiveFilter = widthOfInactiveFilter + permissionTextMargin + badgeInitWidth
  + badgeNumWidth * (
    1 // this represent the extra '/' that the filter button has ex. xx/xx
    + (
      (totalNumberOfFilteredAnnotations > 0
        ? Math.floor(Math.log10(totalNumberOfFilteredAnnotations) + 1)
        : 1)
      + (numberOfMatchesForPermissions[documentFilters.filters.permissions] > 0
        ? Math.floor(
          Math.log10(numberOfMatchesForPermissions[documentFilters.filters.permissions]) + 1,
        )
        : 1)
    )
  );

  function DeepCopyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  // OR filter
  const GetNumberOfMatchesForThisEmail = (annotations, currentFilters, filterEmail) => {
    const f = Object.assign(DeepCopyObj(currentFilters), { annotatedBy: [filterEmail] });
    const ids = FilterAnnotations(annotations, f);
    return ids.left.length + ids.right.length;
  };

  // OR filter
  const GetNumberOfMatchesForThisTag = (annotations, currentFilters, filterTag) => {
    const f = Object.assign(DeepCopyObj(currentFilters), { byTags: [filterTag] });
    const ids = FilterAnnotations(annotations, f);
    return ids.left.length + ids.right.length;
  };

  const GenerateFilterOptions = (userEmail, annotations, filters) => {
    // this function takes in a list of annotations and returns an object of all
    // the filter options that are available for this list of annotations and how
    // many matches each option has with the current filtres applied
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
            // if the permissions is either shared or shared with
            // only me your own name shouldn't show in the dropdown
            // because you can't share an annotation with your self
            if (filters.permissions !== 2 || userEmail !== a.creator.email) {
              filterOptions.annotatedBy.push({
                id: a.creator.email,
                name: FirstNameLastInitial(a.creator.name),
                email: a.creator.email,
                matches: GetNumberOfMatchesForThisEmail(annotations, filters, a.creator.email),
              });
            }
          }


          // second we will add this annotations byTags filterOption
          const uniqueBodyTags = a.body.tags.filter(onlyUnique);
          const newTags = uniqueBodyTags
            .filter((tag) => filterOptions.byTags.findIndex((opt) => opt.name === tag) === -1);
          // take these new tags and map them into an object
          // and add them to the existing list of byTags array
          for (const tag of newTags) {
            filterOptions.byTags.push({
              id: tag,
              name: tag,
              matches: GetNumberOfMatchesForThisTag(annotations, filters, tag),
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
  });

  const UpdateSelectedTokensMatchesValue = (type, selected) => selected.map((s) => {
    const obj = filterOptions[type].find((opt) => opt.id === s.id);
    return Object.assign(s, { matches: obj === undefined ? 0 : obj.matches });
  });

  const FilterOnInit = () => {
    const annotationIds = FilterAnnotations(channelAnnotations, {
      annotatedBy: documentFilters.filters.annotatedBy.map((opt) => opt.email),
      byTags: documentFilters.filters.byTags.map((opt) => opt.name),
      permissions: documentFilters.filters.permissions,
    });
    setDocumentFilters({
      ...documentFilters,
      annotationIds,
      filterOnInit: false,
    });
  };

  useEffect(() => {
    if (documentFilters.filterOnInit && documentFilters.annotationsLoaded) {
      FilterOnInit();
    }
  }, [documentFilters]);

  const updateFilters = (type, selected) => {
    documentFilters.filters[type] = selected;

    const annotationIds = FilterAnnotations(channelAnnotations, {
      annotatedBy: documentFilters.filters.annotatedBy.map((opt) => opt.email),
      byTags: documentFilters.filters.byTags.map((opt) => opt.name),
      permissions: documentFilters.filters.permissions,
    });

    setDocumentFilters({ ...documentFilters, annotationIds });
  };

  const handlePermissionsClick = (ev, n) => {
    if (annotationIdBeingEdited !== undefined) {
      setShow(true);
      setTarget(ev.target);
    } else {
      setShow(false);
      setTarget(null);
      updateFilters('permissions', n);
    }
  };

  const renderMenu = (results, menuProps) => {
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
          <MenuItem
            option={result}
            key={result.name}
            position={index}
            disabled={result.matches === 0}
          >
            <span>{result.name}</span>
            <span style={{ float: 'right' }}>{result.matches}</span>
          </MenuItem>
        ))}
      </Menu>
    );
  };

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

  const filterPopoverComponent = (
    <Popover id="filter-popover">
      <Popover.Content>
        <Card>
          <Card.Header>
            <h5 style={{ marginBottom: 0 }}>Filter Annotations</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col>
                <Form.Group style={{ marginTop: '0px' }}>
                  <Form.Label>By User</Form.Label>
                  <Typeahead
                    id="typehead-annotated-by"
                    labelKey="name"
                    renderMenu={renderMenu}
                    renderToken={renderToken}
                    multiple
                    clearButton
                    highlightOnlyResult
                    disabled={documentFilters.filters.permissions === 0}
                    selected={
                  UpdateSelectedTokensMatchesValue(
                    'annotatedBy',
                    DeepCopyObj(documentFilters.filters.annotatedBy),
                  )
                }
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
                    placeholder="Select one or more tag(s)"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Popover.Content>
    </Popover>
  );

  const unsavedChangesPopoverComponent = (
    <Popover id="popover-contained">
      <Popover.Title as="h3">
        <img
          src="holder.js/20x20?text=%20"
          className="rounded mr-2"
          alt=""
        />
        <span>Unsaved changes</span>
      </Popover.Title>
      <Popover.Content>
        You have an annotation that has unsaved changes.
        {' '}
        <span
          id="scroll-to-annotation-text"
          onClick={() => {
            scrollToAnnotation();
            setShow(false);
          }}
          onKeyDown={() => {}}
        >
          Scroll to
        </span>
        {' '}
        and save the annotation before changing the document view or filtering.
        {' '}
      </Popover.Content>
    </Popover>
  );

  const unsavedChangesOverlay = (
    <Overlay
      show={show}
      target={target}
      placement="bottom"
      container={container.current}
      containerPadding={20}
      onHide={() => { setShow(false); }}
      rootClose
    >
      {unsavedChangesPopoverComponent}
    </Overlay>
  );

  const filterActive = (documentFilters.filters.annotatedBy.length
  + documentFilters.filters.byTags.length > 0);

  return (
    <>
      <ButtonGroup size="sm" aria-label="Permissions" className="permissions-buttons">
        <Button
          variant={documentFilters.filters.permissions === 0 ? 'primary' : 'outline-primary'}
          onClick={(ev) => { handlePermissionsClick(ev, 0); }}
        >
          <PersonFill size="1.2em" />
          <div className="mine">
            <span className="text">Mine</span>
            <Badge variant="light">{numberOfMatchesForPermissions[0]}</Badge>
          </div>
        </Button>
        <Button
          variant={documentFilters.filters.permissions === 1 ? 'primary' : 'outline-primary'}
          onClick={(ev) => { handlePermissionsClick(ev, 1); }}
        >
          <PeopleFill size="1.2em" />
          <div className="shared-with-groups">
            <span className="text">Shared with group(s)</span>
            <Badge variant="light">{numberOfMatchesForPermissions[1]}</Badge>
          </div>
        </Button>
        <Button
          variant={documentFilters.filters.permissions === 2 ? 'primary' : 'outline-primary'}
          onClick={(ev) => { handlePermissionsClick(ev, 2); }}
        >
          <PersonPlusFill size="1.2em" />
          <div className="shared-with-me">
            <span className="text">Shared with me</span>
            <Badge variant="light">{numberOfMatchesForPermissions[2]}</Badge>
          </div>
        </Button>
      </ButtonGroup>
      {unsavedChangesOverlay}
      <OverlayTrigger
        trigger="click"
        key="filter-popover"
        placement="bottom"
        rootClose
        overlay={annotationIdBeingEdited !== undefined
          ? unsavedChangesPopoverComponent
          : filterPopoverComponent}
      >
        <Button
          id="btn-filter-annotation-well"
          size="sm"
          variant={filterActive ? 'primary' : 'outline-primary'}
        >
          <div>
            <Filter size="1em" />
            <span className="text">Filter</span>
            <Badge className={filterActive && 'active'} variant="light">
              {
              `${totalNumberOfFilteredAnnotations}/${numberOfMatchesForPermissions[documentFilters.filters.permissions]}`
              }
            </Badge>
          </div>
        </Button>
      </OverlayTrigger>

      <style jsx global>
        {`

        #scroll-to-annotation-text {
          color: #007bff;
          cursor: pointer;
        }

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

        #btn-filter-annotation-well .text {
          margin-right: ${permissionTextMargin}px;
        }

        #btn-filter-annotation-well .badge {
          opacity: 0.0;
          transition: opacity 0.25s;
        }
        #btn-filter-annotation-well .badge.active {
          opacity: 1.0;
        }

        .permissions-buttons .btn.btn-primary div > .text {
          margin-right: ${permissionTextMargin}px;
        }

        .permissions-buttons .btn.btn-primary div.mine {
          margin-left: 10px;
          width: ${widthOfPermissionsBtns[0]}px;
          opacity: 1;
        }

        .permissions-buttons .btn.btn-primary div.shared-with-groups {
          width: ${widthOfPermissionsBtns[1]}px;
          margin-left:10px;
          opacity: 1;
        }

        .permissions-buttons .btn.btn-primary div.shared-with-me {
          width: ${widthOfPermissionsBtns[2]}px;
          margin-left: 10px;
          opacity: 1;
        }
        
        #btn-filter-annotation-well {
          transition: width 0.5s;
          width: ${widthOfInactiveFilter}px;
          margin-top: 7px;
          float: right;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
        }

        #btn-filter-annotation-well.btn.btn-primary {
          width: ${widthOfActiveFilter}px;
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
