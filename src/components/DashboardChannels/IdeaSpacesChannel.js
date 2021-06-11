import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import {
  Modal, Button, Form, DropdownButton, Dropdown, OverlayTrigger, Tooltip, Spinner, ProgressBar,
} from 'react-bootstrap';
import {
  ArrowDown, ArrowUp, Check, ChevronRight,
} from 'react-bootstrap-icons';
import ReactHtmlParser from 'react-html-parser';
import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';
import TileBadge from '../TileBadge';
import {
  createIdeaSpace,
  deleteIdeaSpace,
  updateAnnotationIdsToIdeaSpace,
  getAllIdeaSpaces,
} from '../../utils/ideaspaceUtils';
import { DeepCopyObj } from '../../utils/docUIUtils';
import { fixIframes } from '../../utils/parseUtil';
import AnnotationTile from './AnnotationTile';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
  annotationsBeingDragged,
  setAnnotationsBeingDragged,
  dashboardState,
  allAnnotations,
}) {
  const [ideaspaces, setIdeaspaces] = useState([]);
  const [openIdeaSpaceDragEnter, setOpenIdeaSpaceDragEnter] = useState();
  const [status, setStatus] = useState();
  const [annotationTilesForIdeaSpace, setAnnotationTilesForIdeaSpace] = useState([]);
  const [showIdeaspacesSortByDropdown, setShowIdeaspacesSortByDropdown] = useState();
  const [ideaspacesInAscendingOrder, setIdeaspacesInAscendingOrder] = useState();
  const [ideaspacesSortByType, setIdeaspacesSortByType] = useState('last-updated');
  const [loadingIdeaSpaces, setLoadingIdeaSpaces] = useState();
  const [openIdeaSpaceTitle, setOpenIdeaSpaceTitle] = useState('');
  // const [refresh, setRefresh] = useState();
  const [deletingIdeaSpace, setDeletingIdeaSpace] = useState();
  const [showNewIdeaSpaceModal, setShowNewIdeaSpaceModal] = useState();
  const [ideaSpaceToDelete, setIdeaSpaceToDelete] = useState();
  const [openIdeaSpaceId, setOpenIdeaSpaceId] = useState();
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

  const updateIdeaSpace = (id, is) => {
    // eslint-disable-next-line no-underscore-dangle
    setIdeaspaces(ideaspaces.map((ideaspace) => (ideaspace._id === id ? is : ideaspace)));
  };

  const deleteAnnotationFromIdeaSpace = async (aid) => {
    const ideaspace = ideaspaces.find(({ _id }) => _id === openIdeaSpaceId);
    if (ideaspace) {
      delete ideaspace.annotationIds[aid];
      await updateAnnotationIdsToIdeaSpace({
        id: openIdeaSpaceId,
        annotationIds: { ...ideaspace.annotationIds },
      })
        .then(async (res) => {
          updateIdeaSpace(openIdeaSpaceId, res.value);
        })
        .catch(() => {
        // pass
        });
    }
  };

  const addAnnotationsToIdeaSpace = async () => {
    setStatus({ annotationsRecieved: true });
    const ideaspace = ideaspaces.find(({ _id }) => _id === openIdeaSpaceId);
    if (ideaspace === undefined) {
      return;
    }
    const { annotationIds } = ideaspace;
    const newAnnotationIds = {};
    const annotationIdsArray = Object.keys(annotationIds);
    const dateAdded = new Date();
    annotationsBeingDragged.map((aid) => {
      if (!annotationIdsArray.includes(aid)) {
        newAnnotationIds[aid] = dateAdded;
      }
      return null;
    });
    const numberOfNewAnnotationIds = Object.keys(newAnnotationIds).length;
    const numberOfExistingAnnotationIds = annotationsBeingDragged.length - numberOfNewAnnotationIds;
    setAnnotationsBeingDragged();
    if (numberOfNewAnnotationIds > 0) {
      await updateAnnotationIdsToIdeaSpace({
        id: openIdeaSpaceId,
        annotationIds: { ...newAnnotationIds, ...annotationIds },
      })
        .then(async (res) => {
          updateIdeaSpace(openIdeaSpaceId, res.value);
          setStatus({
            numberOfNewAnnotations: numberOfNewAnnotationIds,
            numberOfExistingAnnotations: numberOfExistingAnnotationIds,
            done: true,
          });
        })
        .catch(() => {
        // pass
        });
    } else {
      setStatus({
        numberOfNewAnnotations: numberOfNewAnnotationIds,
        numberOfExistingAnnotations: numberOfExistingAnnotationIds,
        done: true,
      });
    }
  };

  const toAnnotationsTile = ({
    _id,
    permissions,
    target: { selector, document: { slug } },
    creator: { name: author },
    modified, body: { value, tags },
  }) => (
    <AnnotationTile
      key={_id}
      id={_id}
      onClick={() => Router.push(`/documents/${slug}?mine=${permissions.private ? 'true' : 'false'}&aid=${_id}&${dashboardState}`)}
      onDelete={() => deleteAnnotationFromIdeaSpace(_id)}
      text={selector.exact}
      author={author}
      annotation={value.length > 0 ? ReactHtmlParser(value, { transform: fixIframes }) : ''}
      activityDate={modified}
      tags={tags}
      draggable
      maxNumberOfAnnotationTags={2}
    />
  );

  const ideaSpaceTiles = loadingIdeaSpaces
    ? <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner animation="border" variant="primary" /></div>
    : ideaspaces.map(
      ({
        _id, name: ideaSpaceName, updatedAt, annotationIds,
      }) => (
        <IdeaSpaceTile
          key={_id}
          id={_id}
          name={ideaSpaceName}
          activityDate={updatedAt}
          onClick={() => {
            setOpenIdeaSpaceId(_id);
            setOpenIdeaSpaceTitle(ideaSpaceName);
          }}
          onDelete={() => {
            setIdeaSpaceToDelete(_id);
          }}
          annotationIds={annotationIds}
          annotationsBeingDragged={annotationsBeingDragged}
          setAnnotationsBeingDragged={setAnnotationsBeingDragged}
          updateIdeaSpace={(is) => updateIdeaSpace(_id, is)}
        />
      ),
    );

  let dragAndDropResult = <></>;
  if (status && status.done) {
    const addedAnnotations = status.numberOfNewAnnotations === 0 ? <></> : (
      <TileBadge
        key="addedAnnotationsText"
        color="green"
        text={status.numberOfNewAnnotations === 1 ? 'Annotation added' : `${status.numberOfNewAnnotations} annotations added`}
        marginLeft={3}
      />
    );
    const existingAnnotations = status.numberOfExistingAnnotations === 0 ? <></> : (
      <TileBadge
        key="existingAnnotationsText"
        color="red"
        text={status.numberOfExistingAnnotations === 1 ? 'Annotation already exists in Idea Space' : `${status.numberOfExistingAnnotations} annotations already exist in Idea Space`}
      />
    );

    dragAndDropResult = (
      <div style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        justifContent: 'center',
      }}
      >
        {addedAnnotations}
        {existingAnnotations}
      </div>
    );
  }
  const openIdeaSpaceDropZone = (
    <div
      style={{
        border: '2px dashed #424242',
        flex: 1,
        paddingTop: 20,
        margin: '10px 0px 20px 0px',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={[
        openIdeaSpaceDragEnter ? styles.tileDragEnter : '',
        status && status.annotationsRecieved ? styles.annotationsRecieved : '',
      ].join(' ')}
      onDragEnter={(e) => {
        e.preventDefault();
        setOpenIdeaSpaceDragEnter(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOpenIdeaSpaceDragEnter(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setOpenIdeaSpaceDragEnter();
      }}
      onDrop={(e) => {
        e.preventDefault();
        if (annotationsBeingDragged) {
          addAnnotationsToIdeaSpace();
        }
        setOpenIdeaSpaceDragEnter();
      }}
    >
      <div style={{ fontSize: 18, color: '#424242' }}>Drag & Drop</div>
      <div style={{ fontSize: 14, color: '#616161' }}>Your annotations here to ad them to this Idea Space</div>
      {status && status.annotationsRecieved
      && (
      <ProgressBar
        animated
        now={100}
        variant="success"
        label={`saving annotation${annotationsBeingDragged && annotationsBeingDragged.length > 1 ? 's' : ''}`}
      />
      )}
      {dragAndDropResult}
    </div>
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
    let annosForIdeaSpace = [];
    if (openIdeaSpaceId) {
      const ideaspace = ideaspaces.find(({ _id }) => _id === openIdeaSpaceId);
      if (ideaspace) {
        const annotationIdsInIdeaSpace = Object.keys(ideaspace.annotationIds);
        const annos = allAnnotations.filter(({ _id }) => annotationIdsInIdeaSpace.includes(_id));
        annosForIdeaSpace = annos.map(toAnnotationsTile);
      }
    }
    setAnnotationTilesForIdeaSpace(annosForIdeaSpace);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIdeaSpaceId, ideaspaces]);

  useEffect(() => {
    loadIdeaSpaces();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status && status.done) {
      setTimeout(() => {
        setStatus();
      }, 3000);
    }
  }, [status]);

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
            onClick={() => setOpenIdeaSpaceId()}
            onFocus={() => {}}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
          >
            Idea Spaces
          </span>
          {openIdeaSpaceId ? (
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
        <div className={styles.tileContainer} style={{ display: 'flex', flexDirection: 'column' }}>
          {openIdeaSpaceId ? (
            <>
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
              {annotationsBeingDragged !== undefined
              || (status && (status.done || status.annotationsRecieved))
                ? openIdeaSpaceDropZone
                : (
                  <div style={{ padding: '10px 0px', flex: 1, overflowY: 'overlay' }}>
                    {annotationTilesForIdeaSpace}
                  </div>
                )}

            </>
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
