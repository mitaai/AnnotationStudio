import React, { useState } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import AdminHeader from '../../../components/Admin/AdminHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Layout from '../../../components/Layout';
import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import AdminDocumentTable from '../../../components/Admin/Document/AdminDocumentTable';

const AdminManageDocument = (props) => {
  const { document, initAlert } = props;
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlert || []);
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
          <AdminHeader
            activeKey="documents"
            setKey={
              (k) => Router.push(`/admin?tab=${k}`).catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]))
            }
          />
          <Card.Body>
            {document && (
              <AdminDocumentTable document={document} />
            )}
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  let props = {};
  await prefetchDocumentBySlug(slug, context.req.headers.cookie)
    .then((document) => {
      props = { document: { ...document, slug } };
    })
    .catch((err) => {
      props = { initAlert: [{ text: err.message, variant: 'danger' }] };
    });
  return { props };
}

export default AdminManageDocument;
