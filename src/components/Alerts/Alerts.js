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
  };
  return alerts[alertName];
}

function Alerts() {
  const [show, setShow] = useState(true);
  const router = useRouter();
  let alertData;
  if (router && router.query) {
    const { alert } = router.query;
    alertData = getData(alert);
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
