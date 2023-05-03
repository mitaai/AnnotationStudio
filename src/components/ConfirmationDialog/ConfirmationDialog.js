import {
  Button, Modal,
} from 'react-bootstrap';

// Only for group deletion now; extend to support multiple types
const ConfirmationDialog = ({
  type,
  show,
  name,
  onClick,
  handleCloseModal,
}) => {
  const groupModalBody = (
    <>
      <p>
        <strong>
          Are you sure you want to delete this group permanently?
        </strong>
        {' '}
        This action cannot be undone.
      </p>
      Documents assigned to this group will not be deleted,
      but may become inaccessible to group members.
    </>
  );

  const documentModalBody = (
    <p>
      <strong>
        Are you sure you want to delete this document permanently?
      </strong>
      {' '}
      This action cannot be undone.
    </p>
  );

  const annotationModalBody = (
    <p>
      <strong>
        Are you sure you want to delete this annotation permanently?
      </strong>
      {' '}
      This action cannot be undone.
    </p>
  );

  const userModalBody = (
    <>
      <p>
        <strong>
          Are you sure you want to delete this user permanently?
        </strong>
        {' '}
        This action cannot be undone.
      </p>
      This user will be removed from all groups. However, documents
      created by this user will not be deleted automatically.
    </>
  );

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'group' && (<>Delete Group</>)}
          {type === 'document' && (<>Delete Document</>)}
          {type === 'annotation' && (<>Delete Annotation</>)}

          {name ? `: ${name}` : <></>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {type === 'group' && groupModalBody}
        {type === 'document' && documentModalBody}
        {type === 'annotation' && annotationModalBody}
        {type === 'user' && userModalBody}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleCloseModal}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={onClick}
        >
          {type === 'group' && (<>Yes, delete this group.</>)}
          {type === 'document' && (<>Yes, delete this document.</>)}
          {type === 'annotation' && (<>Yes, delete this annotation.</>)}
          {type === 'user' && (<>Yes, delete this user.</>)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
