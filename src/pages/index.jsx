import { useState, useEffect } from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import {
  Button, Card,
} from 'react-bootstrap';
import { useSession } from 'next-auth/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import GroupJoinCard from '../components/GroupJoinCard';
import { appendProtocolIfMissing } from '../utils/fetchUtil';
import { GroupsChannel, DocumentsChannel, AnnotationsChannel } from '../components/DashboardChannels';

export default function Home({
  query,
  initAlerts,
  groupId,
  statefulSession,
  updateSession,
  groupToken,
}) {
  const [session, loading] = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);
  const router = useRouter();
  const newReg = query && query.alert && query.alert === 'completeRegistration';

  const [selectedGroupId, setSelectedGroupId] = useState('privateGroup');
  const [selectedDocumentId, setSelectedDocumentId] = useState();
  const [selectedDocumentSlug, setSelectedDocumentSlug] = useState();
  const [documentPermissions, setDocumentPermissions] = useState('shared');
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;
  const breadcrumbs = [
    { name: selectedGroupId === 'privateGroup' ? 'Personal' : session.user.groups.find(({ id }) => id === selectedGroupId).name },
  ];

  useEffect(() => {
    if (session && query) {
      if (query.gid !== undefined && (session.user.groups.some(({ id }) => query.gid === id) || query.gid === 'privateGroup')) {
        setSelectedGroupId(query.gid);
        if (query.did !== undefined && query.slug !== undefined) {
          setSelectedDocumentId(query.did);
          setSelectedDocumentSlug(query.slug);
        }
        setDocumentPermissions(['mine', 'shared'].includes(query.dp) ? query.dp : 'shared');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, session]);

  const showDashboard = session
  && ((session.user && session.user.firstName)
  || statefulSession)
  && !loading;

  return (
    <Layout
      alerts={alerts}
      type="dashboard"
      breadcrumbs={showDashboard ? breadcrumbs : undefined}
      dashboardState={dashboardState}
      newReg={newReg}
      statefulSession={statefulSession}
    >
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {!session && !loading && (
      <Card>
        <Card.Header><Card.Title>Welcome to Annotation Studio</Card.Title></Card.Header>
        <Card.Body>Welcome to Annotation Studio. Please log in to use the application.</Card.Body>
      </Card>
      )}
      {session && session.user && !session.user.firstName && !statefulSession && (
        <Card>
          <Card.Header><Card.Title>Please complete registration</Card.Title></Card.Header>
          <Card.Body>
            <p>
              Please complete your registration by
              {' '}
              <Link href="/user/newuser">clicking here</Link>
              .
            </p>
            <p>
              If you believe you already have compelted registration and this message is in
              error, try
              <Button
                size="sm"
                variant="link"
                onClick={() => router.reload()}
                style={{ padding: '0 0 0 3px', fontSize: '12pt', marginBottom: '4px' }}
              >
                refreshing the page
              </Button>
              .
            </p>
          </Card.Body>
        </Card>
      )}
      {session && ((session.user && session.user.firstName) || statefulSession) && !loading && groupId && groupId !== '' && (
        <GroupJoinCard
          alerts={alerts}
          setAlerts={setAlerts}
          pageFrom="dashboard"
          groupId={groupId}
          session={session}
          updateSession={updateSession}
          token={groupToken}
        />
      )}
      {session && ((session.user && session.user.firstName) || statefulSession) && !loading && (
        <div style={{
          display: 'flex', height: '100%', marginLeft: 15, marginRight: 10,
        }}
        >
          <GroupsChannel
            flex={1}
            session={statefulSession || session}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={(id) => {
              if (id !== selectedGroupId) {
                // if a new group is selected the selected document id and
                // slug should be cleared and set to undefined
                setSelectedGroupId(id);
                setSelectedDocumentId();
                setSelectedDocumentSlug();
              }
            }}
            selectedDocumentId={selectedDocumentId}
            setSelectedDocumentId={setSelectedDocumentId}
            selectedDocumentSlug={selectedDocumentSlug}
            setSelectedDocumentSlug={setSelectedDocumentSlug}
            documentPermissions={documentPermissions}
          />
          <DocumentsChannel
            flex={2}
            session={statefulSession || session}
            selectedGroupId={selectedGroupId}
            setSelectedGroupId={setSelectedGroupId}
            selectedDocumentId={selectedDocumentId}
            setSelectedDocumentId={setSelectedDocumentId}
            selectedDocumentSlug={selectedDocumentSlug}
            setSelectedDocumentSlug={setSelectedDocumentSlug}
            documentPermissions={documentPermissions}
            setDocumentPermissions={setDocumentPermissions}
            setAlerts={setAlerts}
            forceUpdate={!!statefulSession}
          />
          <AnnotationsChannel
            flex={2}
            session={statefulSession || session}
            setAlerts={setAlerts}
            slug={selectedDocumentSlug}
            selectedGroupId={selectedGroupId}
            selectedDocumentId={selectedDocumentId}
            selectedDocumentSlug={selectedDocumentSlug}
            documentPermissions={documentPermissions}
          />
        </div>
      )}
    </Layout>
  );
}

Home.getInitialProps = async (context) => {
  const { query } = context;
  const cookies = parseCookies(context);
  const {
    statefulSession,
  } = query;
  let groupId = '';
  let initAlerts = [];
  if (query.alert === 'completeRegistration') {
    initAlerts = [{
      text: 'You have successfully registered for Annotation Studio. Welcome!',
      variant: 'success',
    }];
    destroyCookie(context, 'ans_grouptoken', {
      path: '/',
    });
  } else if (cookies.ans_grouptoken) {
    const url = `${appendProtocolIfMissing(process.env.SITE)}/api/invite/${cookies.ans_grouptoken}`;
    // eslint-disable-next-line no-undef
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      groupId = result.group;
    }
  }
  if (query.alert === 'joinedGroup') {
    initAlerts = [{
      text: 'Group successfully joined.',
      variant: 'success',
    }];
    destroyCookie(context, 'ans_grouptoken', {
      path: '/',
    });
  }
  const returnObj = {
    query,
    groupId,
    initAlerts,
    statefulSession,
    groupToken: cookies.ans_grouptoken,
  };
  return returnObj;
};
