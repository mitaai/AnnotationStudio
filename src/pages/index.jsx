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
import IdeaSpacesChannel from '../components/DashboardChannels/IdeaSpacesChannel';

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
  const [mode, setMode] = useState('as');
  const router = useRouter();
  const newReg = query && query.alert && query.alert === 'completeRegistration';

  const ASISChannelPositions = {
    as: {
      groups: {
        width: { vw: 20, px: -20 },
        left: { vw: 0, px: 0 },
        opacity: 1,
      },
      documents: {
        width: { vw: 40, px: -40 },
        left: { vw: 20, px: -5 },
        opacity: 1,
      },
      annotations: {
        width: { vw: 40, px: -40 },
        left: { vw: 60, px: -30 },
        opacity: 1,
      },
      ideaspaces: {
        width: { vw: 30, px: -40 },
        left: { vw: 100, px: -30 },
        opacity: 0,
      },
    },
    is: {
      groups: {
        width: { vw: 20, px: -20 },
        left: { vw: -60, px: 30 },
        opacity: 0,
      },
      documents: {
        width: { vw: 40, px: -40 },
        left: { vw: -40, px: 25 },
        opacity: 0,
      },
      annotations: {
        width: { vw: 70, px: -40 },
        left: { vw: 0, px: 0 },
        opacity: 1,
      },
      ideaspaces: {
        width: { vw: 30, px: -40 },
        left: { vw: 70, px: -20 },
        opacity: 1,
      },
    },
  };

  const channelPositions = ASISChannelPositions[mode];

  const [annotationsBeingDragged, setAnnotationsBeingDragged] = useState();
  const [selectedGroupId, setSelectedGroupId] = useState('privateGroup');
  const [selectedDocumentId, setSelectedDocumentId] = useState();
  const [selectedDocumentSlug, setSelectedDocumentSlug] = useState();
  const [documentPermissions, setDocumentPermissions] = useState('shared');
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;
  const breadcrumbs = [
    { name: selectedGroupId === 'privateGroup' ? 'Private' : session.user.groups.find(({ id }) => id === selectedGroupId).name },
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
      mode={mode}
      setMode={setMode}
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
          position: 'relative', height: '100%', marginLeft: 30, marginRight: 30,
        }}
        >
          <GroupsChannel
            width={`calc(${channelPositions.groups.width.vw}vw + ${channelPositions.groups.width.px}px)`}
            left={`calc(${channelPositions.groups.left.vw}vw + ${channelPositions.groups.left.px}px)`}
            opacity={channelPositions.groups.opacity}
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
            width={`calc(${channelPositions.documents.width.vw}vw + ${channelPositions.documents.width.px}px)`}
            left={`calc(${channelPositions.documents.left.vw}vw + ${channelPositions.documents.left.px}px)`}
            opacity={channelPositions.documents.opacity}
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
            width={`calc(${channelPositions.annotations.width.vw}vw + ${channelPositions.annotations.width.px}px)`}
            left={`calc(${channelPositions.annotations.left.vw}vw + ${channelPositions.annotations.left.px}px)`}
            opacity={channelPositions.annotations.opacity}
            mode={mode}
            session={statefulSession || session}
            setAlerts={setAlerts}
            slug={selectedDocumentSlug}
            selectedGroupId={selectedGroupId}
            selectedDocumentId={selectedDocumentId}
            selectedDocumentSlug={selectedDocumentSlug}
            documentPermissions={documentPermissions}
            setAnnotationsBeingDragged={setAnnotationsBeingDragged}
          />
          <IdeaSpacesChannel
            width={`calc(${channelPositions.ideaspaces.width.vw}vw + ${channelPositions.ideaspaces.width.px}px)`}
            left={`calc(${channelPositions.ideaspaces.left.vw}vw + ${channelPositions.ideaspaces.left.px}px)`}
            opacity={channelPositions.ideaspaces.opacity}
            annotationsBeingDragged={annotationsBeingDragged}
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
