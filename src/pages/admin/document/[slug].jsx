import React, { useState } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/client';
import {
  Button, Card, Container,
} from 'react-bootstrap';
import AdminHeader from '../../../components/Admin/AdminHeader';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Layout from '../../../components/Layout';
import ConfirmationDialog from '../../../components/ConfirmationDialog';
import { prefetchDocumentBySlug, deleteDocumentById } from '../../../utils/docUtil';
import AdminDocumentTable from '../../../components/Admin/Document/AdminDocumentTable';

const AdminManageDocument = (props) => {
  const { document, initAlert } = props;
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlert || []);
  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);
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
              <>
                <AdminDocumentTable document={document} alerts={alerts} setAlerts={setAlerts} />
                <Container style={{ display: 'flex', justifyContent: 'space-between' }} className="p-0">
                  <Button
                    type="button"
                    href={`/documents/${document.slug}`}
                  >
                    View Document
                  </Button>
                  <Button
                    type="button"
                    variant="warning"
                    href={`/documents/${document.slug}/edit`}
                  >
                    Modify Document
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleShowModal}
                  >
                    Delete Document
                  </Button>
                  <ConfirmationDialog
                    name={document.title}
                    type="document"
                    handleCloseModal={handleCloseModal}
                    show={showModal}
                    onClick={(event) => {
                      event.target.setAttribute('disabled', 'true');
                      deleteDocumentById(document.id).then(() => {
                        Router.push({
                          pathname: '/admin',
                          query: {
                            alert: { text: 'Document deleted successfully', variant: 'sucess' },
                            tab: 'documents',
                          },
                        });
                      }).catch((err) => {
                        setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
                      });
                      handleCloseModal();
                    }}
                  />
                </Container>
              </>
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
