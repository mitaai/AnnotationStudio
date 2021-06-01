import React, { useState } from 'react';

import {
  Modal, Button, Form,
} from 'react-bootstrap';
import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';
import TileBadge from '../TileBadge';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
}) {
  const [showNewIdeaSpaceModal, setShowNewIdeaSpaceModal] = useState();
  const ideaSpaceTiles = [
    <IdeaSpaceTile name="Name of Idea Space" activityDate={new Date()} onClick={() => {}} numberOfAnnotations={0} />,
    <IdeaSpaceTile name="Name of Idea Space" activityDate={new Date()} onClick={() => {}} numberOfAnnotations={5} />,
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
          <span className={styles.headerText}>
            Idea Spaces
          </span>
          <TileBadge text="New + " color="yellow" onClick={() => setShowNewIdeaSpaceModal(true)} />
        </div>
        <div className={styles.tileContainer}>
          {ideaSpaceTiles}
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
