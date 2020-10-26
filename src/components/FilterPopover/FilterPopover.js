import React, { useState } from 'react';
import $ from 'jquery';
import {
  Nav, Row, Col, Navbar, Breadcrumb, Container, Button, OverlayTrigger, Popover, Form, Card, ButtonGroup,
} from 'react-bootstrap';

import { Filter } from 'react-bootstrap-icons';

import {
  Typeahead, Menu, MenuItem, Token,
} from 'react-bootstrap-typeahead';
// Import as a module in your JS
import 'react-bootstrap-typeahead/css/Typeahead.css';

function FilterPopover() {
  const [byTagsTypeheadMarginTop, setByTagsTypeheadMarginTop] = useState(0);
  const [byTagsTypeheadMarginBottom, setByTagsTypeheadMarginBottom] = useState(0);

  const [selectedPermissions, setSelectedPermissions] = useState(0);

  const annotatedByOptions = [
    { name: 'Ben S.', matches: 14 },
    { name: 'Courtney L.', matches: 6 },
    { name: 'Joshua M.', matches: 0 },
    { name: 'Kurt F.', matches: 1 },
  ];

  const byTagsOptions = [
    { name: 'analogy', matches: 4 },
    { name: 'dark', matches: 6 },
    { name: 'dialog', matches: 0 },
    { name: 'metaphor', matches: 1 },
    { name: 'monologue', matches: 0 },
    { name: 'rhetorical device', matches: 10 },
    { name: 'simile', matches: 7 },
    { name: 'spooky', matches: 2 },
    { name: 'analogy2', matches: 4 },
    { name: 'dark2', matches: 6 },
    { name: 'dialog2', matches: 0 },
    { name: 'metaphor2', matches: 1 },
    { name: 'monologue2', matches: 0 },
    { name: 'rhetorical device2', matches: 10 },
    { name: 'simile2', matches: 7 },
    { name: 'spooky2', matches: 2 },
  ];

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
                          onChange={() => {}}
                          onMenuToggle={(isOpen) => {
                            if (isOpen) {
                              setByTagsTypeheadMarginTop($('#typehead-annotated-by').height() + 10);
                            } else {
                              setByTagsTypeheadMarginTop(0);
                            }
                          }}
                          onInputChange={() => { setByTagsTypeheadMarginTop($('#typehead-annotated-by').height() + 10); }}
                          options={annotatedByOptions}
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
                          onChange={() => {}}
                          onMenuToggle={(isOpen) => {
                            if (isOpen) {
                              setByTagsTypeheadMarginBottom($('#typehead-by-tags').height() + 20);
                            } else {
                              setByTagsTypeheadMarginBottom(0);
                            }
                          }}
                          onInputChange={() => { setByTagsTypeheadMarginBottom($('#typehead-by-tags').height() + 20); }}
                          options={byTagsOptions}
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
        <Button id="btn-filter-annotation-well" variant="outline-primary">
          <Filter size="1em" />
          <span>Filter</span>
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
