import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

function Alerts({ alerts }) {
  const [show, setShow] = useState({});
  useEffect(() => {
    const alertsToAdd = {};
    for (let i = 0; i < alerts.length; i += 1) {
      if (!Object.keys(show).includes(`alert[${i}]`)) {
        alertsToAdd[`alert[${i}]`] = true;
      }
    }
    setShow((prevState) => ({ ...prevState, ...alertsToAdd }));
  }, [alerts]);

  return (
    <>
      {alerts && alerts.length > 0 && show && alerts.map((alert, idx) => (
        show[`alert[${idx}]`] && (
          <Alert
            variant={alert.variant}
            onClose={() => setShow({ ...show, [`alert[${idx}]`]: false })}
            dismissible
            key={`alert[${idx}]`} // eslint-disable-line react/no-array-index-key
          >
            {alert.text}
          </Alert>
        )
      ))}
    </>
  );
}

export default Alerts;
