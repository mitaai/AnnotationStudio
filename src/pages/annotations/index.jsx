import React, { useState } from 'react';
import { useSession } from 'next-auth/client';
import { Card } from 'react-bootstrap';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import DashboardAnnotationList from '../../components/Dashboard/DashboardAnnotationList';

const AnnotationsListVIew = ({
  props, statefulSession,
}) => {
  const { tab } = props;
  const [session, loading] = useSession();
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
      <Card>
        <Card.Header><Card.Title>Not authorized</Card.Title></Card.Header>
        <Card.Body>Please log in to use the application.</Card.Body>
      </Card>
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
