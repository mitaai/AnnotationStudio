import { useEffect, useState } from 'react';
import $ from 'jquery';
import {
  Row,
  Col,
  Card,
  Form,
  ButtonGroup,
  InputGroup,
  FormControl,
  Button,
  Badge,
  Dropdown,
  ListGroup,
} from 'react-bootstrap';


function AnnotationCard({
  side, annotation, focusOnAnnotation, initializedAsEditing,
}) {
  const [editing, setEditing] = useState(initializedAsEditing !== undefined ? initializedAsEditing : false);
  const [expanded, setExpanded] = useState(false);
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

  useEffect(() => {
    if (updateFocusOfAnnotation) {
      focusOnAnnotation();
      setUpdateFocusOfAnnotation(false);
    }
  });

  return (
    <>
      <Card id={annotation._id} onClick={focusOnAnnotation} onMouseOver={() => { AddClassActive(annotation._id); }} onMouseOut={() => { RemoveClassActive(annotation._id); }} className="annotation-card-container" style={side === 'left' ? { left: '5px' } : { right: '5px' }}>
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
        <Card.Header className="annotation-header">
          <span className="float-left">{annotation.user}</span>
          <span className="float-right">
            <span>{annotation.date}</span>
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
          </span>
        </Card.Header>
        {editing
          ? (
            <>
              <Form>
                <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                  <ListGroup.Item className="annotation-body">
                    <Form.Group controlId="exampleForm.ControlTextarea1">
                      <Form.Control style={{ fontSize: '12px' }} as="textarea" rows="3" placeholder="annotation" defaultValue={annotation.annotation} />
                    </Form.Group>
                  </ListGroup.Item>
                  <ListGroup.Item className="annotation-tags">
                    <Form.Group controlId="formGroupEmail">
                      <Form.Control type="text" style={{ fontSize: '12px' }} placeholder="add some tags here..." defaultValue={annotation.tags.join(' ')} />
                    </Form.Group>
                  </ListGroup.Item>
                </ListGroup>
                <Row>
                  <Col lg={7}>
                    <InputGroup id="input-group-share-annotation">
                      <InputGroup.Prepend>
                        <InputGroup.Checkbox id="checkbox-share-annotation" aria-label="Checkbox for following text input" />
                      </InputGroup.Prepend>
                      <FormControl id="input-share-annotation" aria-label="Text input with checkbox" defaultValue="Share with my groups" readOnly />
                    </InputGroup>
                  </Col>
                  <Col lg={5}>
                    <Button className="btn-save-annotation-edits" variant="primary" size="sm">Save</Button>
                    <Button className="btn-cancel-annotation-edits" onClick={() => { setEditing(false); setUpdateFocusOfAnnotation(true); }} variant="secondary" size="sm">Cancel</Button>
                  </Col>
                </Row>

              </Form>
            </>
          )
          : (
            <>
              <ListGroup variant="flush" style={{ borderTop: 'none' }}>
                <ListGroup.Item className="annotation-body">{annotation.annotation}</ListGroup.Item>
                <ListGroup.Item className="annotation-tags">
                  {annotation.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </ListGroup.Item>
              </ListGroup>
            </>
          )}

      </Card>
      <style jsx global>
        {`

        .line1, .line2 {
            position:absolute;
            width:1px;
            margin-top:-1px;
            background-color:#eeeeee;
            z-index: 2;
            transition: background-color 0.5s;
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
            margin: 0px 0px 5px 5px;
        }

        .annotation-more-options-dropdown-menu {
            font-size: 12px;
        }

        #input-share-annotation {
            font-size: 12px;
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
