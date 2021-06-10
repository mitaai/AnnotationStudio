import React, { useEffect, useState } from 'react';

import {
  Modal, Button, Form, DropdownButton, Dropdown, OverlayTrigger, Tooltip, Spinner,
} from 'react-bootstrap';
import {
  ArrowDown, ArrowUp, Check, ChevronRight,
} from 'react-bootstrap-icons';
import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';
import TileBadge from '../TileBadge';
import { createIdeaSpace, getAllIdeaSpaces } from '../../utils/ideaspaceUtils';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
  annotationsBeingDragged,
}) {
  const [ideaspaces, setIdeaSpaces] = useState([]);
  const [loadingIdeaSpaces, setLoadingIdeaSpaces] = useState();
  const [openIdeaSpaceTitle, setOpenIdeaSpaceTitle] = useState('');
  // const [refresh, setRefresh] = useState();
  const [showNewIdeaSpaceModal, setShowNewIdeaSpaceModal] = useState();
  const [open, setOpen] = useState();
  const [name, setName] = useState('');
  const [creatingIdeaSpace, setCreatingIdeaSpace] = useState();
  const [ascending, setAscending] = useState();
  const [dropdownOpen, setDropdownOpen] = useState();
  const [dropdownSelection, setDropdownSelection] = useState('updated');
  const dropdownOptions = {
    updated: 'date updated',
    added: 'date added to Idea Space',
  };

  const ideaSpaceTiles = loadingIdeaSpaces
    ? <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner animation="border" variant="primary" /></div>
    : ideaspaces.map(
      ({
        _id, name: ideaSpaceName, updatedAt, annotationIds,
      }) => (
        <IdeaSpaceTile
          key={_id}
          name={ideaSpaceName}
          activityDate={updatedAt}
          onClick={() => {
            setOpen(_id);
            setOpenIdeaSpaceTitle(ideaSpaceName);
          }}
          numberOfAnnotations={annotationIds ? Object.keys(annotationIds).length : 0}
          annotationIds={annotationIds}
          annotationsBeingDragged={annotationsBeingDragged}
        />
      ),
    );

  const createNewIdeaSpace = async () => {
    setCreatingIdeaSpace(true);
    await createIdeaSpace({ name })
      .then(async (newIdeaSpace) => {
        console.log(newIdeaSpace);
        setCreatingIdeaSpace();
        setShowNewIdeaSpaceModal();
      })
      .catch(() => {
        setCreatingIdeaSpace();
        setShowNewIdeaSpaceModal();
      });
    setName('');
  };

  const loadIdeaSpaces = async () => {
    setLoadingIdeaSpaces(true);
    await getAllIdeaSpaces()
      .then(async (res) => {
        setIdeaSpaces(res.ideaspaces);
        setLoadingIdeaSpaces();
      })
      .catch(() => {
        setLoadingIdeaSpaces();
      });
  };

  useEffect(() => {
    loadIdeaSpaces();
  }, []);

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
              <input className={styles.titleInput} type="text" value={openIdeaSpaceTitle} />
            </>
          )
            : <TileBadge text="New + " color="yellow" onClick={() => setShowNewIdeaSpaceModal(true)} />}
        </div>
        <div className={styles.tileContainer}>
          {open ? (
            <div className={styles.ideaSpaceHeader}>
              <span style={{ color: '#424242' }}>Sort by</span>
              <DropdownButton
                id="sort-by-dropdown"
                title={dropdownOptions[dropdownSelection]}
                variant="light"
                className={`${styles.sortByDropdown} ${dropdownOpen ? styles.sortByDropdownSelected : ''}`}
                show={dropdownOpen}
                onToggle={() => setDropdownOpen(!dropdownOpen)}
                onSelect={(e) => setDropdownSelection(e)}
              >
                <Dropdown.Item eventKey="updated">
                  {dropdownOptions.updated}
                  {dropdownSelection === 'updated' && <Check className={styles.dropdownCheck} size={18} />}
                </Dropdown.Item>
                <Dropdown.Item eventKey="added">
                  {dropdownOptions.added}
                  {dropdownSelection === 'added' && <Check className={styles.dropdownCheck} size={18} />}
                </Dropdown.Item>
              </DropdownButton>
              <OverlayTrigger
                placement="right"
                overlay={(
                  <Tooltip className="styled-tooltip right">
                    {ascending ? 'Ascending' : 'Descending'}
                  </Tooltip>
      )}
              >
                <Button
                  className={styles.descendingAscendingButton}
                  variant="light"
                  onClick={() => setAscending(!ascending)}
                >
                  {ascending ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                </Button>
              </OverlayTrigger>

            </div>
          ) : ideaSpaceTiles}
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
          {creatingIdeaSpace
            ? <Spinner animation="border" variant="primary" /> : (
              <Form>
                <Form.Group controlId="exampleForm.ControlInput1">
                  <Form.Control type="text" placeholder="descriptive name" value={name} onChange={(e) => setName(e.target.value)} />
                </Form.Group>
              </Form>
            )}

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowNewIdeaSpaceModal();
              setName('');
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={createNewIdeaSpace}>Create</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
