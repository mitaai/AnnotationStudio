import React, { useState } from 'react';
import {
  Nav,
} from 'react-bootstrap';
import FeedbackModal from './FeedbackModal';

const FeedbackButton = ({ session }) => {
  const [modalShow, setModalShow] = useState(false);
  return (
    <>
      {session && (
        <>
          <Nav.Link
            onClick={() => setModalShow(true)}
            style={{ color: '#f5c83a', textDecoration: 'none' }}
          >
            Feedback
          </Nav.Link>

          <FeedbackModal
            show={modalShow}
            setShow={setModalShow}
            session={session}
          />
        </>
      )}
    </>
  );
};

export default FeedbackButton;
