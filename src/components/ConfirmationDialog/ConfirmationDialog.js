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

  return (
    <Modal
      show={show}
      onHide={handleCloseModal}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'group' && (<>Delete Group:</>)}
          {type === 'document' && (<>Delete Document:</>)}
          {' '}
          {name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {type === 'group' && groupModalBody}
        {type === 'document' && documentModalBody}
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
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationDialog;
