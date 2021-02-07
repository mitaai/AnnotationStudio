import { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';

function Alerts({ alerts }) {
  const [mount, setMount] = useState({});

  useEffect(() => {
    const alertsToMount = {};

    for (let i = 0; i < alerts.length; i += 1) {
      if (!Object.keys(mount).includes(`alert[${i}]`)) {
        alertsToMount[`alert[${i}]`] = true;
        setTimeout(() => {
          alertsToMount[`alert[${i}]`] = false;
          setMount(
            (prevState) => ({ ...prevState, ...alertsToMount }),
          );
        }, 5000);
      }
    }
    setMount(
      (prevState) => ({ ...prevState, ...alertsToMount }),
    );
  }, [alerts]);

  return (
    <>
      {alerts && alerts.length > 0 && mount && alerts.map((alert, idx) => (
        mount[`alert[${idx}]`] && (
          <Alert
            variant={alert.variant}
            onClose={(prevState) => setMount({ ...prevState, [`alert[${idx}]`]: false })}
            dismissible
            key={`${alert.text}${Math.random()}`}
            style={{
              position: 'fixed',
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: '5',
            }}
          >
            {alert.text}
          </Alert>
        )
      ))}
    </>
  );
}

export default Alerts;
