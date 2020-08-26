import {
  Button, Modal,
} from 'react-bootstrap';

// Only for group deletion now; extend to support multiple types
const ConfirmationDialog = ({
  // type,
  show,
  value,
  onClick,
  handleCloseModal,
}) => (
  <Modal
    show={show}
    onHide={handleCloseModal}
  >
    <Modal.Header closeButton>
      <Modal.Title>
        Delete Group:
        {' '}
        {(value.name)}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p>
        <strong>
          Are you sure you want to
          delete this group permanently?
        </strong>
        This action cannot be undone.
      </p>
      Documents assigned to this group will not be deleted,
      but may become inaccessible to group members.
    </Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button
        variant="danger"
        onClick={onClick}
      >
        Yes, delete this group
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmationDialog;
