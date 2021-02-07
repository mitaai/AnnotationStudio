import React, { useState } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import AdminHeader from '../../../components/Admin/AdminHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Layout from '../../../components/Layout';
import { prefetchUserById } from '../../../utils/userUtil';
import AdminUserTable from '../../../components/Admin/User/AdminUserTable';

const AdminManageUser = (props) => {
  const { user, initAlert, statefulSession } = props;
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlert || []);
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
      {!loading && session && session.user.role === 'admin' && (
        <Card>
          <AdminHeader
            activeKey="users"
            setKey={
              (k) => Router.push(`/admin?tab=${k}`).catch((err) => setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]))
            }
          />
          <Card.Body>
            {user && (
              <AdminUserTable
                user={user}
                alerts={alerts}
                setAlerts={setAlerts}
                isSelf={session.user.email === user.email}
              />
            )}
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;
  let props = {};
  await prefetchUserById(id, context.req.headers.cookie)
    .then((user) => {
      props = { user: { ...user, id } };
    })
    .catch((err) => {
      props = { initAlert: [{ text: err.message, variant: 'danger' }] };
    });
  return { props };
}

export default AdminManageUser;
