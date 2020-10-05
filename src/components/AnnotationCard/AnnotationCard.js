import { useState } from 'react';

import {
  Row,
  Col,
  Card,
  Form,
  ButtonGroup,
  Button,
  Badge,
  Dropdown,
  ListGroup,
} from 'react-bootstrap';


function AnnotationCard({ side, expanded }) {
  const [editing, setEditing] = useState(false);

  return (
    <>
      <Card className="annotation-card-container">
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
        <Card.Header className="annotation-header">
          <span className="float-left">@username</span>
          <span className="float-right">
            <span>10/02/2020</span>
            <Dropdown className="annotation-more-options-dropdown">
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                <svg width="0.8em" height="0.8em" viewBox="0 0 16 16" className="bi bi-three-dots-vertical" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                </svg>
              </Dropdown.Toggle>

              <Dropdown.Menu className="annotation-more-options-dropdown-menu">
                <Dropdown.Item href="#/action-1" onClick={() => { setEditing(true); }}>Edit</Dropdown.Item>
                <Dropdown.Item href="#/action-2">Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </span>
        </Card.Header>
        {editing
          ? (
            <>
              <Form>
                <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                  <ListGroup.Item className="annotation-body">
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                      <Form.Control style={{ fontSize: '12px' }} as="textarea" rows="3" placeholder="annotation" />
                    </Form.Group>
                  </ListGroup.Item>
                  <ListGroup.Item className="annotation-tags">
                    <Form.Group controlId="formGroupEmail">
                      <Form.Control type="text" style={{ fontSize: '12px' }} placeholder="add some tags here..." />
                    </Form.Group>
                  </ListGroup.Item>
                </ListGroup>
                <Button className="btn-save-annotation-edits" variant="primary" size="sm">Save</Button>
                <Button className="btn-cancel-annotation-edits" onClick={()=>{setEditing(false)}} variant="secondary" size="sm">Cancel</Button>
              </Form>
            </>
          )
          : (
            <>
              <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                <ListGroup.Item className="annotation-body">The way the author uses metaphor in this sentence creates a comparison that showcases character development</ListGroup.Item>
                <ListGroup.Item className="annotation-tags">
                  <Badge variant="secondary">metaphor</Badge>
                  <Badge variant="secondary">character-development</Badge>
                </ListGroup.Item>
              </ListGroup>
            </>
          )}

      </Card>
      <style jsx global>
        {`

        .annotation-card-container .form-group {
            margin-bottom: 0px;
        }

        .btn-save-annotation-edits, .btn-cancel-annotation-edits {
            margin: 5px 0px 5px 5px;
        }

        .annotation-more-options-dropdown-menu {
            font-size: 12px;
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

        .annotation-card-container {
            border: 1px solid rgb(220, 220, 220);
            border-radius: 0px;
            width: 100%;
        }
          
          .annotation-pointer-background-left {
              position: absolute;
              right: -21px;
              top: 3px;
              width: 0px;
              height: 0px;
              border: 10px solid transparent;
              border-left-color: rgb(220,220,220);
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
            left: -21px;
            top: 3px;
            width: 0px;
            height: 0px;
            border: 10px solid transparent;
            border-right-color: rgb(220,220,220);
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
