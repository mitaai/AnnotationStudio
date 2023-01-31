import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from 'react-bootstrap';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import DashboardAnnotationList from '../../components/Dashboard/DashboardAnnotationList';

const AnnotationsListVIew = ({
  props, statefulSession,
}) => {
  const { tab } = props;
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [alerts, setAlerts] = useState([]);

  return (
    <Layout alerts={alerts} type="annotations" statefulSession={statefulSession}>
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {!session && !loading && (
        <UnauthorizedCard />
      )}
      {session && !loading && (
        <DashboardAnnotationList
          session={session}
          alerts={alerts}
          setAlerts={setAlerts}
          mode="list"
          tab={tab}
        />
      )}
    </Layout>
  );
};

AnnotationsListVIew.getInitialProps = async (context) => {
  const { tab } = context.query;
  let props = {};
  if (tab) props = { tab };
  return { props };
};

export default AnnotationsListVIew;
