import React from 'react';
import {
  Button,
  Form,
  Modal,
} from 'react-bootstrap';
import { Formik } from 'formik';
import unfetch from 'unfetch';

const sendEmail = async (user, text) => {
  const url = '/api/feedback';
  const res = await unfetch(url, {
    method: 'POST',
    body: JSON.stringify({ name: user.name, text }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (res.status === 200) {
    const result = await res.json();
    return Promise.resolve(result);
  } return Promise.reject(Error(`Unable to send email: error ${res.status} received from server`));
};

const FeedbackModal = ({ show, setShow, session }) => (
  <Formik
    key="feedback-form"
    initialValues={{ feedback: '' }}
    onSubmit={async (values, actions) => {
      await sendEmail(session.user, values.feedback)
        .catch((error) => {
          setShow(false);
          actions.setSubmitting(false);
          throw new Error('SEND_FEEDBACK_EMAIL_ERROR', error);
        });
      setShow(false);
      actions.setSubmitting(false);
    }}
  >
    {(props) => (
      <Form noValidate onSubmit={props.handleSubmit}>
        <Modal
          show={show}
          onHide={() => {
            setShow(false);
          }}
          size="lg"
          aria-labelledby="feedback-modal-title"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="feedback-modal-title">
              Submit Feedback
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h5>Thank you for testing out this early version of Annotation Studio 4.</h5>
            <Form.Group controlId="feedback-textarea">
              <Form.Label>
                Here you may submit feedback directly
                to the Annotation Studio team.
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                value={props.values.feedback}
                name="feedback"
                placeholder="Write feedback"
              />
            </Form.Group>
            {props.errors.feedback && <div id="feedback">{props.errors.feedback}</div>}
          </Modal.Body>
          <Modal.Footer style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outline-secondary" onClick={() => { setShow(false); }}>Cancel</Button>
            <Button
              variant="primary"
              type="submit"
              onClick={props.handleSubmit}
              disabled={props.isSubmitting || props.errors.feedback || props.values.feedback === ''}
            >
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    )}
  </Formik>
);

export default FeedbackModal;
