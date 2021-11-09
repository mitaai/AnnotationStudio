/* eslint-disable no-underscore-dangle */
import React, { useEffect, useState, useRef } from 'react';
import debounce from 'lodash.debounce';
import {
  Modal, Button, Form, DropdownButton, Dropdown, OverlayTrigger, Tooltip, Spinner, ProgressBar,
} from 'react-bootstrap';
import {
  ArrowDown, ArrowUp, Check, CheckCircleFill, ChevronRight,
} from 'react-bootstrap-icons';
import styles from './DashboardChannels.module.scss';
import IdeaSpaceTile from './IdeaSpaceTile';
import TileBadge from '../TileBadge';
import {
  createIdeaSpace,
  deleteIdeaSpace,
  updateIdeaSpaceData,
  getAllIdeaSpaces,
} from '../../utils/ideaspaceUtils';
import { DeepCopyObj } from '../../utils/docUIUtils';
import { ListLoadingSpinner } from './HelperComponents';

export default function IdeaSpacesChannel({
  width,
  left,
  opacity,
  annotationsBeingDragged,
  setAnnotationsBeingDragged,
  toAnnotationsTile,
  allAnnotations,
}) {
  const [ideaspaces, setIdeaspaces] = useState([]);
  const [openIdeaSpaceDragEnter, setOpenIdeaSpaceDragEnter] = useState();
  const [status, setStatus] = useState();
  const [ideaspaceNameStatus, setIdeaspaceNameStatus] = useState();
  const [annotationTilesForIdeaSpace, setAnnotationTilesForIdeaSpace] = useState([]);
  const [showIdeaspacesSortByDropdown, setShowIdeaspacesSortByDropdown] = useState();
  const [ideaspacesInAscendingOrder, setIdeaspacesInAscendingOrder] = useState();
  const [ideaspacesSortByType, setIdeaspacesSortByType] = useState('last-updated');
  const [loadingIdeaSpaces, setLoadingIdeaSpaces] = useState();
  const [openIdeaSpaceName, setOpenIdeaSpaceName] = useState('');
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

  const updateIdeaSpaces = (is) => {
    const newIdeaspaces = ideaspaces.map(
      (ideaspace) => (ideaspace._id === is._id ? is : ideaspace),
    );
    setIdeaspaces(newIdeaspaces);
  };

  const saveIdeaSpaceName = async (id, ideaspaceName, callback = () => {}) => {
    await updateIdeaSpaceData({
      id,
      name: ideaspaceName,
    })
      .then(async (res) => {
        callback(res.value);
      })
      .catch(() => {
        setIdeaspaceNameStatus('error');
      });
  };

  const saveIdeaSpaceNameDebounced = useRef(
    debounce(saveIdeaSpaceName, 2000),
  ).current;

  const deleteAnnotationFromIdeaSpace = async (aid) => {
    const ideaspace = ideaspaces.find(({ _id }) => _id === openIdeaSpaceId);
    if (ideaspace) {
      delete ideaspace.annotationIds[aid];
      await updateIdeaSpaceData({
        id: openIdeaSpaceId,
        annotationIds: { ...ideaspace.annotationIds },
      })
        .then(async (res) => {
          updateIdeaSpaces(res.value);
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
    annotationsBeingDragged.ids.map((aid) => {
      if (!annotationIdsArray.includes(aid)) {
        newAnnotationIds[aid] = dateAdded;
      }
      return null;
    });
    const numberOfNewAnnotationIds = Object.keys(newAnnotationIds).length;
    const numberOfExistingAnnotationIds = annotationsBeingDragged.ids.length
      - numberOfNewAnnotationIds;
    setAnnotationsBeingDragged();
    if (numberOfNewAnnotationIds > 0) {
      await updateIdeaSpaceData({
        id: openIdeaSpaceId,
        annotationIds: { ...newAnnotationIds, ...annotationIds },
      })
        .then(async (res) => {
          updateIdeaSpaces(res.value);
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

  let ideaSpaceTiles = <></>;
  if (loadingIdeaSpaces) {
    ideaSpaceTiles = <div style={{ display: 'flex', justifyContent: 'center' }}><Spinner animation="border" variant="primary" /></div>;
  } else if (ideaspaces.length === 0) {
    ideaSpaceTiles = (
      <div style={{
        background: 'white', borderRadius: 5, padding: 12,
      }}
      >
        <div style={{ fontSize: 18, color: '#424242', fontWeight: 'bold' }}>Create your first Idea Space!</div>
        <div style={{ fontSize: 14, color: '#616161' }}>Click the &quot;New +&quot; button above to create your first Idea Space.</div>
      </div>
    );
  } else {
    ideaSpaceTiles = ideaspaces.map(
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
            setOpenIdeaSpaceName(ideaSpaceName);
            setIdeaspaceNameStatus();
          }}
          onDelete={() => {
            setIdeaSpaceToDelete({ _id, name: ideaSpaceName });
          }}
          annotationIds={annotationIds}
          annotationsBeingDragged={annotationsBeingDragged}
          setAnnotationsBeingDragged={setAnnotationsBeingDragged}
          updateIdeaSpace={(is) => updateIdeaSpaces(is)}
        />
      ),
    );
  }

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

    let existingText = '';
    let existingAnnotations = <></>;

    if (status.numberOfExistingAnnotations > 0) {
      if (status.numberOfExistingAnnotations === 1) {
        if (status.numberOfNewAnnotations === 0) {
          existingText = 'That annotation already exists in this Idea Space';
        } else {
          existingText = '1 annotation already exists in this Idea Space';
        }
      } else {
        existingText = `${status.numberOfExistingAnnotations} annotations already exist in Idea Space`;
      }
      existingAnnotations = (
        <TileBadge
          key="existingAnnotationsText"
          color="red"
          maxWidth={300}
          text={existingText}
        />
      );
    }

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
        label={`saving annotation${annotationsBeingDragged && annotationsBeingDragged.ids.length > 1 ? 's' : ''}`}
      />
      )}
      {dragAndDropResult}
    </div>
  );

  const ideaspaceComparison = () => {
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

  const annotationComparison = () => {
    if (dropdownSelection === 'updated') {
      return (a, b) => {
        if (a.modified > b.modified) {
          return ascending ? 1 : -1;
        } if (a.modified < b.modified) {
          return ascending ? -1 : 1;
        }
        return 0;
      };
    }
    if (dropdownSelection === 'added') {
      return (a, b) => {
        if (a.created > b.created) {
          return ascending ? 1 : -1;
        } if (a.created < b.created) {
          return ascending ? -1 : 1;
        }
        return 0;
      };
    }

    return () => {};
  };

  const createNewIdeaSpace = async () => {
    setCreatingIdeaSpace(true);
    await createIdeaSpace({ name })
      .then(async (newIdeaSpace) => {
        const newIdeaspaces = DeepCopyObj(ideaspaces)
          .concat([newIdeaSpace])
          .sort(ideaspaceComparison());
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
        setIdeaspaces(res.ideaspaces.sort(ideaspaceComparison()));
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
    await deleteIdeaSpace(ideaSpaceToDelete._id)
      .then(async () => {
        setIdeaspaces(ideaspaces.filter(({ _id }) => _id !== ideaSpaceToDelete._id));
        setIdeaSpaceToDelete();
        setDeletingIdeaSpace();
      })
      .catch(() => {
        setLoadingIdeaSpaces();
        setIdeaSpaceToDelete();
      });
  };

  const updateIdeaSpaceName = (ideaspaceName) => {
    setIdeaspaceNameStatus('saving');
    setOpenIdeaSpaceName(ideaspaceName);
    saveIdeaSpaceNameDebounced(openIdeaSpaceId, ideaspaceName, (ideaspace) => {
      updateIdeaSpaces(ideaspace);
      setIdeaspaceNameStatus('saved');
    });
  };

  useEffect(() => {
    let annosForIdeaSpace = [];
    if (openIdeaSpaceId) {
      const ideaspace = ideaspaces.find(({ _id }) => _id === openIdeaSpaceId);
      if (ideaspace) {
        const annotationIdsInIdeaSpace = Object.keys(ideaspace.annotationIds);
        const annos = allAnnotations
          .filter(({ _id }) => annotationIdsInIdeaSpace.includes(_id))
          .sort(annotationComparison());
        annosForIdeaSpace = annos.map((anno) => toAnnotationsTile(
          anno,
          {
            onDelete: () => deleteAnnotationFromIdeaSpace(anno._id),
            from: 'ideaspaceChannel',
            draggable: true,
            linkTarget: '_blank',
            maxNumberOfTags: 2,
          },
        ));
      }
    }
    setAnnotationTilesForIdeaSpace(annosForIdeaSpace);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIdeaSpaceId, ideaspaces, dropdownSelection, ascending]);

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
    setIdeaspaces(DeepCopyObj(ideaspaces.sort(ideaspaceComparison())));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaspacesSortByType, ideaspacesInAscendingOrder]);

  return (
    <>
      <div
        className={styles.channelContainer}
        style={{
          width, left, opacity, minWidth: 300,
        }}
      >
        <div className={styles.headerContainer} style={{ alignItems: 'center' }}>
          <span
            className={styles.headerText}
            onClick={() => setOpenIdeaSpaceId()}
            onFocus={() => {}}
            onKeyDown={() => {}}
            role="button"
            tabIndex={-1}
          >
            Ideas
          </span>
          {openIdeaSpaceId ? (
            <>
              <ChevronRight size={14} />
              <input
                className={styles.titleInput}
                type="text"
                placeholder="title"
                value={openIdeaSpaceName}
                onChange={(e) => updateIdeaSpaceName(e.target.value)}
              />
              <div style={{ width: 20 }}>
                {ideaspaceNameStatus === 'saved'
                && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={(
                    <Tooltip className="styled-tooltip bottom">
                      Saved!
                    </Tooltip>
                  )}
                >
                  <CheckCircleFill size={16} color="#45AC87" />
                </OverlayTrigger>
                )}
                {ideaspaceNameStatus === 'saving'
                && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={(
                    <Tooltip className="styled-tooltip bottom">
                      Saving...
                    </Tooltip>
                )}
                >
                  <Spinner animation="border" variant="primary" size="sm" />
                </OverlayTrigger>
                )}
              </div>
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
        <div className={styles.tileContainer} style={{ display: 'flex', flexDirection: 'column', paddingTop: 0 }}>
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
              {(annotationsBeingDragged && annotationsBeingDragged.from !== 'ideaspaceChannel')
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
            ? <ListLoadingSpinner marginTop={0} variant="primary" /> : (
              <Form>
                <Form.Group controlId="exampleForm.ControlInput1" style={{ marginBottom: 0 }}>
                  <Form.Control type="text" placeholder="title" value={name} onChange={(e) => setName(e.target.value)} />
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
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Idea Space</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'flex', justifyContent: deletingIdeaSpace ? 'center' : 'left' }}>
          {deletingIdeaSpace
            ? <Spinner animation="border" variant="danger" /> : (
              <div>{`Are you sure you want to delete "${ideaSpaceToDelete ? ideaSpaceToDelete.name : ''}"?`}</div>
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
