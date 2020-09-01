import { useState } from 'react';
import { useRouter } from 'next/router';
import { Alert } from 'react-bootstrap';

function getData(alertName) {
  const alerts = {
    completeRegistration: {
      text: 'You have successfully registered for Annotation Studio. Welcome!',
      variant: 'success',
    },
    updateProfile: {
      text: 'Profile updated.',
      variant: 'success',
    },
    newGroup: {
      text: 'Group created successfully.',
      variant: 'success',
    },
    deletedGroup: {
      text: 'You have successfully deleted the group.',
      variant: 'success',
    },
    changeUserRole: {
      text: 'User\'s role changed successfully.',
      variant: 'success',
    },
    removeUser: {
      text: 'User successfully removed from group.',
      variant: 'success',
    },
    addUser: {
      text: 'User successfully added to group.',
      variant: 'success',
    },
    renameGroup: {
      text: 'Group successfully renamed.',
      variant: 'success',
    },
    joinedGroup: {
      text: 'Group successfully joined.',
      variant: 'success',
    },
    createdToken: {
      text: 'Group invite token created successfully.',
      variant: 'success',
    },
    deletedToken: {
      text: 'Group invite token deleted successfully.',
      variant: 'warning',
    },
  };
  return alerts[alertName];
}

function getError(error) {
  return {
    text: error,
    variant: 'danger',
  };
}

function Alerts() {
  const [show, setShow] = useState(true);
  const router = useRouter();
  let alertData;
  if (router && router.query) {
    const { alert, error } = router.query;
    if (alert) alertData = getData(alert);
    if (error) alertData = getError(error);
  }
  return (
    <>
      { alertData && show && (
      <Alert variant={alertData.variant} onClose={() => setShow(false)} dismissible>
        {alertData.text}
      </Alert>
      )}
    </>
  );
}

export default Alerts;
