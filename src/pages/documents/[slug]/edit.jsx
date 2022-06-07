import unfetch from 'unfetch';
import { useSession } from 'next-auth/client';
import React, { useState, useEffect } from 'react';
import {
  Card, Col,
} from 'react-bootstrap';
import Layout from '../../../components/Layout';
import LoadingSpinner from '../../../components/LoadingSpinner';
import UnauthorizedCard from '../../../components/UnauthorizedCard';

import { prefetchDocumentBySlug } from '../../../utils/docUtil';
import CreateEditDocument from '../../../components/CreateEditDocument';

const EditDocument = ({
  query, document, alerts, statefulSession,
}) => {
  const [session, loading] = useSession();
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState(alerts || []);
  const {
    did,
    slug,
    dp,
    gid,
    // eslint-disable-next-line no-unused-vars
    exportDocument,
  } = query || {};
  // eslint-disable-next-line no-unused-vars
  const dashboardStateQuery = {
    did, slug, dp, gid,
  };

  const cloudfrontUrl = process.env.NEXT_PUBLIC_SIGNING_URL.split('/url')[0];

  const showEditDocumentContent = session && document && !loading && !pageLoading;
  const userUnauthorizedToViewContent = document.owner !== session?.user?.id && session?.user?.role !== 'admin';

  useEffect(() => {
    if (document && document.text && (document.uploadContentType === 'text/slate-html' || document.uploadContentType === 'text/html')
      && document.text.length < 255 && document.text.includes(cloudfrontUrl)) {
      unfetch(document.text.substring(
        document.text.indexOf(cloudfrontUrl), document.text.indexOf('.html') + 5,
      ), {
        method: 'GET',
        headers: {
          'Content-Type': 'text/html',
        },
      }).then((res) => {
        res.text().then((result) => {
          // eslint-disable-next-line no-param-reassign
          document.text = result;
          setPageLoading(false);
        });
      }).catch((err) => {
        setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        setPageLoading(false);
      });
    } else {
      setPageLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  return (
    showEditDocumentContent && !userUnauthorizedToViewContent
      ? (
        <CreateEditDocument
          session={session}
          loading={loading}
          statefulSession={statefulSession}
          document={document}
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

  return { props };
}

export default EditDocument;
