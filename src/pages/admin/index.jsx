import React, { useState } from 'react';
import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import AdminPanel from '../../components/Admin/AdminPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import Layout from '../../components/Layout';

const AdminView = ({ props }) => {
  const { tab, initAlerts } = props;
  const [key, setKey] = useState(tab || 'dashboard');
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);
  return (
    <Layout type="admin" alerts={alerts}>
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {!loading && (!session || session.user.role !== 'admin') && (
        <Card>
          <Card.Body>
            Sorry, you do not have persmission to view this page.
          </Card.Body>
        </Card>
      )}
      {!loading && session && session.user.role === 'admin' && (
        <AdminPanel
          alerts={alerts}
          setAlerts={setAlerts}
          session={session}
          activeKey={key}
          setKey={setKey}
        />
      )}
    </Layout>
  );
};

AdminView.getInitialProps = async (context) => {
  const { tab, alert } = context.query;
  let props = {};
  if (tab) props = { ...props, tab };
  if (alert) props = { ...props, initAlerts: [alert] };
  return { props };
};

export default AdminView;
