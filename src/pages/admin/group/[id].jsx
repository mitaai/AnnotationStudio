import React, { useState } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import AdminHeader from '../../../components/Admin/AdminHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Layout from '../../../components/Layout';
import { prefetchGroupById } from '../../../utils/groupUtil';
import AdminGroupTable from '../../../components/Admin/Group/AdminGroupTable';

const AdminManageGroup = (props) => {
  const { group, initAlerts, statefulSession } = props;
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);
  return (
    <Layout
      type="admin"
      alerts={alerts}
      statefulSession={statefulSession}
      document={{ title: group.name }}
    >
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
        <Card>
          <AdminHeader
            activeKey="groups"
            setKey={
              (k) => Router.push(`/admin?tab=${k}`).catch((err) => setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]))
            }
          />
          <Card.Body>
            {group && (
              <AdminGroupTable group={group} alerts={alerts} setAlerts={setAlerts} />
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
  await prefetchGroupById(id, context.req.headers.cookie)
    .then((group) => {
      props = { group: { ...group, id } };
    })
    .catch((err) => {
      props = { initAlerts: [{ text: err.message, variant: 'danger' }] };
    });
  return { props };
}

export default AdminManageGroup;
