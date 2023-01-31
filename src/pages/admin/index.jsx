import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  Card,
} from 'react-bootstrap';
import AdminPanel from '../../components/Admin/AdminPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import Layout from '../../components/Layout';

const AdminView = ({ props, statefulSession }) => {
  const { tab, initAlerts } = props;
  const [key, setKey] = useState(tab || 'dashboard');
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [alerts, setAlerts] = useState(initAlerts || []);
  return (
    <Layout type="admin" alerts={alerts} statefulSession={statefulSession}>
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
      {!loading && session && session.user && session.user.role === 'admin' && (
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
  if (alert) {
    if (alert === 'deletedDocument') props = { ...props, initAlerts: [{ text: 'Document deleted successfully', variant: 'warning' }] };
    else if (alert === 'deletedUser') props = { ...props, initAlerts: [{ text: 'User deleted successfully', variant: 'warning' }] };
    else if (alert === 'deletedGroup') props = { ...props, initAlerts: [{ text: 'Group deleted successfully', variant: 'warning' }] };
    else if (alert === 'userChangedRole') props = { ...props, initAlerts: [{ text: 'User role changed successfully', variant: 'success' }] };
    else if (alert === 'userReassignedAnnotations') props = { ...props, initAlerts: [{ text: 'Annotations reassigned successfully', variant: 'success' }] };
  }
  return { props };
};

export default AdminView;
