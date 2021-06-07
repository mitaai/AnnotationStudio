import React, { useState } from 'react';

import {
  Modal, Button, Form,
} from 'react-bootstrap';
import { ChevronRight } from 'react-bootstrap-icons';
import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';
import TileBadge from '../TileBadge';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
  annotationsBeingDragged,
}) {
  const [showNewIdeaSpaceModal, setShowNewIdeaSpaceModal] = useState();
  const [open, setOpen] = useState();
  const ideaSpaceTiles = [
    <IdeaSpaceTile
      name="Name of Idea Space"
      activityDate={new Date()}
      onClick={() => setOpen(true)}
      numberOfAnnotations={0}
      annotationsBeingDragged={annotationsBeingDragged}
    />,
  ];
  return (
    <>
      <div
        className={styles.channelContainer}
        style={{
          width, left, minWidth: 300, opacity,
        }}
      >
        <div className={styles.headerContainer}>
          <span
            className={styles.headerText}
            onClick={() => setOpen()}
            onFocus={() => {}}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
          >
            Idea Spaces
          </span>
          {open ? (
            <>
              <ChevronRight size={14} />
              <input className={styles.titleInput} type="text" value="hello and goodbye" />
            </>
          )
            : <TileBadge text="New + " color="yellow" onClick={() => setShowNewIdeaSpaceModal(true)} />}
        </div>
        <div className={styles.tileContainer}>
          {open ? <div>Open Idea Space</div> : ideaSpaceTiles}
        </div>

      </div>
      <Modal
        show={showNewIdeaSpaceModal}
        onHide={() => setShowNewIdeaSpaceModal()}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Idea Space</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Control type="email" placeholder="descriptive name" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewIdeaSpaceModal()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowNewIdeaSpaceModal()}>Create</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
