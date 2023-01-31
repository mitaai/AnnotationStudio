import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import {
  Card, Col,
} from 'react-bootstrap';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import UnauthorizedCard from '../../../components/UnauthorizedCard';

import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import CreateEditDocument from '../../../components/CreateEditDocument';

const EditDocument = ({
  query, document, alerts, statefulSession, refererUrl,
}) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const pathname = refererUrl || '/documents';
  // eslint-disable-next-line no-unused-vars
  const [pageLoading, setPageLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [errors, setErrors] = useState(alerts || []);
  const {
    did,
    slug,
    dp,
    gid,
  } = query || {};
  const dashboardStateQuery = {
    did, slug, dp, gid,
  };

  const showEditDocumentContent = session && document && !loading && !pageLoading;
  const userUnauthorizedToViewContent = document.owner !== session?.user?.id && session?.user?.role !== 'admin';


  return (
    showEditDocumentContent && !userUnauthorizedToViewContent
      ? (
        <CreateEditDocument
          mode="edit"
          session={session}
          loading={loading}
          statefulSession={statefulSession}
          document={document}
          onCancel={() => {
            router.push({
              pathname,
              query: {
                ...dashboardStateQuery,
              },
            });
          }}
          onDelete={() => {
            router.push({
              pathname,
              query: {
                ...dashboardStateQuery,
                // if we delete the document then there is no document data (slug/did) to reference
                // in the url
                slug: undefined,
                did: undefined,
              },
              alert: 'deletedDocument',
            });
          }}
          onSave={(ops) => {
            router.push({
              pathname: `/documents/${document?.slug || ops.slug}`,
              query: {
                alert: 'editedDocument',
              },
            });
          }}
        />
      )
      : (
        <Layout
          alerts={errors}
          type="document"
          title={document ? `Edit Document: ${document.title}` : 'error'}
          document={document}
          statefulSession={statefulSession}
        >
          <Col lg="12" className="mx-auto">
            <Card>
              {((!session && loading) || (session && pageLoading)) && (
              <LoadingSpinner />
              )}
              {!session && !loading && (
              <UnauthorizedCard />
              )}
              {session && !document && !loading && !pageLoading && (
              <>
                <Card.Header><Card.Title>Document not found</Card.Title></Card.Header>
                <Card.Body>Sorry, this document could not be found.</Card.Body>
              </>
              )}
              {showEditDocumentContent && userUnauthorizedToViewContent && (
              <UnauthorizedCard />
              )}
            </Card>
          </Col>
        </Layout>
      )
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  let props = {};
  await prefetchDocumentBySlug(slug, context.req.headers.cookie).then((response) => {
    props = {
      query: context.query,
      document: {
        slug,
        ...response,
      },
    };
  }).catch((err) => {
    props = {
      alerts: [{ text: err.message, variant: 'danger' }],
    };
  });

  return {
    props: { ...props, refererUrl: context?.req?.headers?.referer?.split('?')[0] || null },
  };
}

export default EditDocument;
