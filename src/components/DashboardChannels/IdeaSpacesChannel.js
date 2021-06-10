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
import { createIdeaSpace, deleteIdeaSpace, getAllIdeaSpaces } from '../../utils/ideaspaceUtils';
import { DeepCopyObj } from '../../utils/docUIUtils';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
  annotationsBeingDragged,
}) {
  const [ideaspaces, setIdeaspaces] = useState([]);
  const [showIdeaspacesSortByDropdown, setShowIdeaspacesSortByDropdown] = useState();
  const [ideaspacesInAscendingOrder, setIdeaspacesInAscendingOrder] = useState();
  const [ideaspacesSortByType, setIdeaspacesSortByType] = useState('last-updated');
  const [loadingIdeaSpaces, setLoadingIdeaSpaces] = useState();
  const [openIdeaSpaceTitle, setOpenIdeaSpaceTitle] = useState('');
  // const [refresh, setRefresh] = useState();
  const [deletingIdeaSpace, setDeletingIdeaSpace] = useState();
  const [showNewIdeaSpaceModal, setShowNewIdeaSpaceModal] = useState();
  const [ideaSpaceToDelete, setIdeaSpaceToDelete] = useState();
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

  let nameOfIdeaSpaceToDelete = '';
  if (ideaSpaceToDelete) {
    const isToDelete = ideaspaces.find(({ _id }) => _id === ideaSpaceToDelete);
    if (isToDelete) {
      nameOfIdeaSpaceToDelete = isToDelete.name;
    }
  }

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
          onDelete={() => {
            setIdeaSpaceToDelete(_id);
          }}
          numberOfAnnotations={annotationIds ? Object.keys(annotationIds).length : 0}
          annotationIds={annotationIds}
          annotationsBeingDragged={annotationsBeingDragged}
        />
      ),
    );

  const comparison = () => {
    if (ideaspacesSortByType === 'last-updated') {
      return (a, b) => {
        if (a.updatedAt > b.updatedAt) {
          return ideaspacesInAscendingOrder ? 1 : -1;
        } if (a.updatedAt < b.updatedAt) {
          return ideaspacesInAscendingOrder ? -1 : 1;
        }
        return 0;
      };
    }
    if (ideaspacesSortByType === 'date-created') {
      return (a, b) => {
        if (a.createdAt > b.createdAt) {
          return ideaspacesInAscendingOrder ? 1 : -1;
        } if (a.createdAt < b.createdAt) {
          return ideaspacesInAscendingOrder ? -1 : 1;
        }
        return 0;
      };
    }

    if (ideaspacesSortByType === 'name') {
      return (a, b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) {
          return ideaspacesInAscendingOrder ? 1 : -1;
        }
        if (a.name.toLowerCase() === b.name.toLowerCase()) {
          if (a.name < b.name) {
            return ideaspacesInAscendingOrder ? 1 : -1;
          }
          return 0;
        }
        return ideaspacesInAscendingOrder ? -1 : 1;
      };
    }

    return () => {};
  };

  const createNewIdeaSpace = async () => {
    setCreatingIdeaSpace(true);
    await createIdeaSpace({ name })
      .then(async (newIdeaSpace) => {
        const newIdeaspaces = DeepCopyObj(ideaspaces).concat([newIdeaSpace]).sort(comparison());
        setIdeaspaces(newIdeaspaces);
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
        setIdeaspaces(res.ideaspaces.sort(comparison()));
        setLoadingIdeaSpaces();
        setIdeaSpaceToDelete();
      })
      .catch(() => {
        setLoadingIdeaSpaces();
        setIdeaSpaceToDelete();
      });
  };

  const deleteIS = async () => {
    setDeletingIdeaSpace(true);
    await deleteIdeaSpace(ideaSpaceToDelete)
      .then(async () => {
        setIdeaspaces(ideaspaces.filter(({ _id }) => _id !== ideaSpaceToDelete));
        setIdeaSpaceToDelete();
        setDeletingIdeaSpace();
      })
      .catch(() => {
        setLoadingIdeaSpaces();
        setIdeaSpaceToDelete();
      });
  };

  useEffect(() => {
    loadIdeaSpaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIdeaspaces(DeepCopyObj(ideaspaces.sort(comparison())));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaspacesSortByType, ideaspacesInAscendingOrder]);

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
            : (
              <>
                <TileBadge
                  text="New + "
                  color="yellow"
                  onClick={() => setShowNewIdeaSpaceModal(true)}
                />
                <span style={{ flex: 1 }} />
                <DropdownButton
                  key="ideaspaces-sortby-dropdown"
                  id="ideaspaces-sortby-dropdown-btn"
                  variant="light"
                  style={{ fontSize: 13 }}
                  className={`${styles.sortByDropdown} ${showIdeaspacesSortByDropdown ? styles.sortByDropdownSelected : ''}`}
                  title="Sort By"
                  onClick={() => setShowIdeaspacesSortByDropdown(true)}
                  show={showIdeaspacesSortByDropdown}
                  onToggle={(isOpen, e, { source }) => {
                    if (source === 'rootClose') {
                      setShowIdeaspacesSortByDropdown();
                    }
                  }}
                  onSelect={(e) => {
                    if (e === 'asc') {
                      setIdeaspacesInAscendingOrder(true);
                    } else if (e === 'desc') {
                      setIdeaspacesInAscendingOrder();
                    } else {
                      setIdeaspacesSortByType(e);
                    }
                  }}
                >
                  <Dropdown.Item
                    eventKey="last-updated"
                    className={styles.ideaspacesSortByDropdownItem}
                  >
                    <span style={{ flex: 1 }}>
                      Last Updated
                    </span>
                    {ideaspacesSortByType === 'last-updated'
                    && <Check className={styles.dropdownCheck} size={18} />}
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="date-created"
                    className={styles.ideaspacesSortByDropdownItem}
                  >
                    <span style={{ flex: 1 }}>Date Created</span>
                    {ideaspacesSortByType === 'date-created'
                    && <Check className={styles.dropdownCheck} size={18} />}
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="name"
                    className={styles.ideaspacesSortByDropdownItem}
                  >
                    <span style={{ flex: 1 }}>Name</span>
                    {ideaspacesSortByType === 'name'
                      && <Check className={styles.dropdownCheck} size={18} />}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    eventKey="asc"
                    className={styles.ideaspacesSortByDropdownItem}
                  >
                    <span style={{ flex: 1 }}>
                      <span>Asc</span>
                      <ArrowUp style={{ marginLeft: 10 }} size={14} />
                    </span>
                    {ideaspacesInAscendingOrder
                    && <Check className={styles.dropdownCheck} size={18} />}
                  </Dropdown.Item>
                  <Dropdown.Item
                    eventKey="desc"
                    className={styles.ideaspacesSortByDropdownItem}
                  >
                    <span style={{ flex: 1 }}>
                      <span>Desc</span>
                      <ArrowDown size={14} />
                    </span>
                    {!ideaspacesInAscendingOrder
                    && <Check className={styles.dropdownCheck} size={18} />}
                  </Dropdown.Item>
                </DropdownButton>
              </>
            )}
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
                  {dropdownSelection === 'updated'
                  && <Check className={styles.dropdownCheck} size={18} />}
                </Dropdown.Item>
                <Dropdown.Item eventKey="added">
                  {dropdownOptions.added}
                  {dropdownSelection === 'added'
                  && <Check className={styles.dropdownCheck} size={18} />}
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
      <Modal
        show={ideaSpaceToDelete !== undefined}
        onHide={() => setShowNewIdeaSpaceModal()}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Idea Space</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deletingIdeaSpace
            ? <Spinner animation="border" variant="primary" /> : (
              <span>{`Are you sure you want to delete "${nameOfIdeaSpaceToDelete}"?`}</span>
            )}

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setIdeaSpaceToDelete();
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteIS}>Delete</Button>
        </Modal.Footer>
      </Modal>
      <style jsx global>
        {`
        #ideaspaces-sortby-dropdown-btn {
          font-size: 14px;
        }
          `}
      </style>
    </>
  );
}
