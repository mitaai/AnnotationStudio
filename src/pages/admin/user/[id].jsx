import React, { useState } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import AdminHeader from '../../../components/Admin/AdminHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Layout from '../../../components/Layout';

const AdminManageUser = () => {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState([]);
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
        <Card>
          <AdminHeader activeKey="users" setKey={(k) => Router.push(`/admin?tab=${k}`)} />
          <Card.Body>
            User info here
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
};

export default AdminManageUser;
