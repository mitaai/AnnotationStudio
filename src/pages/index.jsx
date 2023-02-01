import { useState, useEffect } from 'react';
import { parseCookies, destroyCookie } from 'nookies';
import ReactHtmlParser from 'react-html-parser';
import $ from 'jquery';
import {
  Button, Card,
} from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';

import { fixIframes } from '../utils/parseUtil';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import GroupJoinCard from '../components/GroupJoinCard';
import { appendProtocolIfMissing } from '../utils/fetchUtil';
import { GroupsChannel, DocumentsChannel, AnnotationsChannel } from '../components/DashboardChannels';
import IdeaSpacesChannel from '../components/DashboardChannels/IdeaSpacesChannel';
import AnnotationTile from '../components/DashboardChannels/AnnotationTile';
import SplashPage from '../components/SplashPage';
import { useWindowSize } from '../utils/customHooks';

export default function Home({
  query,
  initAlerts,
  groupId,
  statefulSession,
  updateSession,
  groupToken,
}) {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState(initAlerts || []);
  const windowSize = useWindowSize();
  const [mobileView, setMobileView] = useState();
  const [offsetLeft, setOffsetLeft] = useState();
  const [allAnnotations, setAllAnnotations] = useState();
  const [mode, setMode] = useState('as');
  const [modeChanged, setModeChanged] = useState();
  const [groupMembers, setGroupMembers] = useState({});
  const router = useRouter();
  const newReg = query && query.alert && query.alert === 'completeRegistration';
  const loading = status === 'loading';

  const channelsMinWidth = 1375;
  const ASISChannelPositions = {
    as: {
      groups: {
        width: { vw: 22, px: -20 },
        minWidth: 375,
        left: { vw: 0, px: 30 },
        minLeft: 30,
        opacity: 1,
      },
      documents: {
        width: { vw: 38, px: -40 },
        minWidth: 490,
        left: { vw: 22, px: 25 },
        minLeft: 420,
        opacity: 1,
      },
      annotations: {
        width: { vw: 40, px: -40 },
        minWidth: 430,
        left: { vw: 60, px: 0 },
        minLeft: 935,
        opacity: 1,
      },
      ideaspaces: {
        width: { vw: 30, px: -40 },
        minWidth: 300,
        left: { vw: 100, px: 0 },
        minLeft: 1385,
        opacity: 0,
      },
    },
    is: {
      groups: {
        width: { vw: 20, px: -20 },
        minWidth: 375,
        left: { vw: -60, px: 60 },
        minLeft: -640,
        opacity: 0,
      },
      documents: {
        width: { vw: 40, px: -40 },
        minWidth: 400,
        left: { vw: -40, px: 55 },
        minLeft: -245,
        opacity: 0,
      },
      annotations: {
        width: { vw: 70, px: -40 },
        minWidth: 770,
        left: { vw: 0, px: 30 },
        minLeft: 30,
        opacity: 1,
      },
      ideaspaces: {
        width: { vw: 30, px: -40 },
        minWidth: 385,
        left: { vw: 70, px: 10 },
        minLeft: 820,
        opacity: 1,
      },
    },
  };

  const channelPos = ASISChannelPositions[mode];
  // eslint-disable-next-line no-undef
  const channelPositions = mobileView
    ? {
      groups: {
        width: `${channelPos.groups.minWidth}px`,
        left: `${channelPos.groups.minLeft + offsetLeft}px`,
      },
      documents: {
        width: `${channelPos.documents.minWidth}px`,
        left: `${channelPos.documents.minLeft + offsetLeft}px`,
      },
      annotations: {
        width: `${channelPos.annotations.minWidth}px`,
        left: `${channelPos.annotations.minLeft + offsetLeft}px`,
      },
      ideaspaces: {
        width: `${channelPos.ideaspaces.minWidth}px`,
        left: `${channelPos.ideaspaces.minLeft + offsetLeft}px`,
      },
    }
    : {
      groups: {
        width: `calc(${channelPos.groups.width.vw}% + ${channelPos.groups.width.px}px)`,
        left: `calc(${channelPos.groups.left.vw}% + ${channelPos.groups.left.px}px)`,
      },
      documents: {
        width: `calc(${channelPos.documents.width.vw}% + ${channelPos.documents.width.px}px)`,
        left: `calc(${channelPos.documents.left.vw}% + ${channelPos.documents.left.px}px)`,
      },
      annotations: {
        width: `calc(${channelPos.annotations.width.vw}% + ${channelPos.annotations.width.px}px)`,
        left: `calc(${channelPos.annotations.left.vw}% + ${channelPos.annotations.left.px}px)`,
      },
      ideaspaces: {
        width: `calc(${channelPos.ideaspaces.width.vw}% + ${channelPos.ideaspaces.width.px}px)`,
        left: `calc(${channelPos.ideaspaces.left.vw}% + ${channelPos.ideaspaces.left.px}px)`,
      },
    };

  const [annotationsBeingDragged, setAnnotationsBeingDragged] = useState();
  const [selectedGroupId, setSelectedGroupId] = useState('privateGroup');
  const [selectedDocumentId, setSelectedDocumentId] = useState();
  const [selectedDocumentSlug, setSelectedDocumentSlug] = useState();
  const [documents, setDocuments] = useState({});
  const [documentPermissions, setDocumentPermissions] = useState('shared');
  const [groupPermissions, setGroupPermissions] = useState('active');
  const updateGroupPermissions = (val) => {
    setGroupPermissions(val);
    setSelectedGroupId();
    setSelectedDocumentId();
    setSelectedDocumentSlug();
  };

  const dashboardState = `${selectedDocumentId && selectedDocumentSlug ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}${groupPermissions && `groupP=${groupPermissions}`}${selectedGroupId && `&gid=${selectedGroupId}`}`;
  const breadcrumbs = selectedGroupId
    ? [
      { name: selectedGroupId === 'privateGroup' ? 'Personal' : session.user.groups.find(({ id }) => id === selectedGroupId)?.name },
    ] : [];

  const toAnnotationsTile = ({
    _id,
    oid,
    permissions,
    target: { selector, document },
    creator: { name },
    modified,
    body: { value, tags },
  }, extraInfo) => {
    const defaultExtraInfo = {
      dbs: dashboardState,
      from: 'annotationsChannel',
      onDelete: undefined,
      onClick: undefined,
      linkTarget: undefined,
      openInAnnotationStudio: false,
      maxNumberOfTags: 3,
      shareableLink: undefined,
      setAlerts: undefined,
      draggable: false,
    };
    const {
      dbs,
      from,
      onDelete,
      onClick,
      linkTarget,
      openInAnnotationStudio,
      maxNumberOfTags,
      shareableLink,
      setAlerts: setAlertsFunc,
      draggable,
    } = extraInfo ? { ...defaultExtraInfo, ...extraInfo } : defaultExtraInfo;

    const url = `/documents/${document.slug}?mine=${permissions.private ? 'true' : 'false'}&aid=${_id}&${dbs}`;
    const openInAS = linkTarget === '_blank'
      // eslint-disable-next-line no-undef
      ? () => window.open(url, '_blank')
      : () => Router.push(url);

    return (
      <AnnotationTile
        key={`${oid || _id}-${from}`}
        id={oid || _id}
        onClick={onClick || openInAS}
        openInAnnotationStudio={openInAnnotationStudio ? openInAS : undefined}
        onDelete={onDelete}
        text={selector.exact}
        author={name}
        annotation={value.length > 0 ? ReactHtmlParser(value, { transform: fixIframes }) : ''}
        activityDate={modified}
        tags={tags}
        draggable={draggable}
        maxNumberOfAnnotationTags={maxNumberOfTags}
        shareableLink={shareableLink}
        setAlerts={setAlertsFunc}
        setAnnotationsBeingDragged={(ids) => {
          if (ids) {
            setAnnotationsBeingDragged({ ids, from });
          } else {
            setAnnotationsBeingDragged();
          }
        }}
      />
    );
  };

  useEffect(() => {
    const minLeft = windowSize.width
      * (channelPos.groups.width.vw / 100)
      + channelPos.groups.left.px;
    if (windowSize.width < channelsMinWidth) {
      setMobileView(true);
      setOffsetLeft(0);
    } else if (minLeft < channelPos.documents.minLeft) {
      setMobileView(true);
      setOffsetLeft((windowSize.width - channelsMinWidth) / 2);
    } else if (windowSize.width >= channelsMinWidth) {
      setMobileView();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize]);

  useEffect(() => {
    // this makes sure that these changes in state came from click on the Open Idea Space button
    // which triggers setMode and setModeChanged hooks
    if (modeChanged) {
      $('#channels-scroll-container').animate({
        scrollLeft: mode === 'is' ? 0 : channelsMinWidth,
      }, 500);
    }
  }, [mode, modeChanged]);

  useEffect(() => {
    if (session && query) {
      if (query.gid !== undefined && (session.user.groups.some(({ id }) => query.gid === id) || query.gid === 'privateGroup')) {
        setSelectedGroupId(query.gid);
        if (query.did !== undefined && query.slug !== undefined) {
          setSelectedDocumentId(query.did);
          setSelectedDocumentSlug(query.slug);
        }
        setDocumentPermissions(['mine', 'core-documents', 'shared'].includes(query.dp) ? query.dp : 'shared');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, session]);

  const showDashboard = session
  && ((session.user && session.user.firstName)
  || statefulSession)
  && !loading;

  const splashPage = !session && !loading;

  return (
    <Layout
      alerts={alerts}
      type="dashboard"
      splashPage={splashPage}
      breadcrumbs={showDashboard ? breadcrumbs : undefined}
      dashboardState={dashboardState}
      newReg={newReg}
      statefulSession={statefulSession}
      mode={mode}
      setMode={(m) => {
        setMode(m);
        if (!modeChanged) {
          setModeChanged(true);
        }
      }}
    >
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {splashPage && <SplashPage />}
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
      {session && ((session.user && session.user.firstName) || statefulSession)
        && !loading && groupId && groupId !== '' && (
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
        <div
          id="channels-scroll-container"
          style={{
            position: 'relative', height: '100%', width: '100%', overflowX: 'overlay',
          }}
        >
          <div style={{
            position: 'relative', height: '100%', width: `max(100%, ${channelsMinWidth}px)`, overflow: 'hidden',
          }}
          >
            <GroupsChannel
              width={channelPositions.groups.width}
              left={channelPositions.groups.left}
              opacity={channelPos.groups.opacity}
              session={statefulSession || session}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={(id) => {
                if (statefulSession) {
                  // console.log(statefulSession);
                } else if (session) {
                  // console.log(session);
                }
                if (id !== selectedGroupId) {
                  // if a new group is selected the selected document id and
                  // slug should be cleared and set to undefined
                  setSelectedGroupId(id);
                  setSelectedDocumentId();
                  setSelectedDocumentSlug();
                  if (id === 'privateGroup') {
                    setDocumentPermissions('mine');
                  } else {
                    setDocumentPermissions('core-documents');
                  }
                }
              }}
              setSelectedDocumentId={setSelectedDocumentId}
              setSelectedDocumentSlug={setSelectedDocumentSlug}
              setGroupMembers={setGroupMembers}
              groupPermissions={groupPermissions}
              setGroupPermissions={updateGroupPermissions}
              dashboardState={dashboardState}
            />
            <DocumentsChannel
              width={channelPositions.documents.width}
              left={channelPositions.documents.left}
              opacity={channelPos.documents.opacity}
              session={statefulSession || session}
              selectedGroupId={selectedGroupId}
              setSelectedGroupId={setSelectedGroupId}
              selectedDocumentId={selectedDocumentId}
              setSelectedDocumentId={setSelectedDocumentId}
              setSelectedDocumentSlug={setSelectedDocumentSlug}
              documents={documents}
              setDocuments={setDocuments}
              documentPermissions={documentPermissions}
              setDocumentPermissions={setDocumentPermissions}
              groupMembers={groupMembers}
              setAlerts={setAlerts}
              forceUpdate={!!statefulSession}
              dashboardState={dashboardState}
            />
            <AnnotationsChannel
              width={channelPositions.annotations.width}
              left={channelPositions.annotations.left}
              opacity={channelPos.annotations.opacity}
              mode={mode}
              session={statefulSession || session}
              setAlerts={setAlerts}
              slug={selectedDocumentSlug}
              selectedGroupId={selectedGroupId}
              selectedDocumentId={selectedDocumentId}
              selectedDocumentSlug={selectedDocumentSlug}
              documents={documents}
              documentPermissions={documentPermissions}
              annotationsBeingDragged={annotationsBeingDragged}
              setAnnotationsBeingDragged={setAnnotationsBeingDragged}
              toAnnotationsTile={toAnnotationsTile}
              allAnnotations={allAnnotations}
              setAllAnnotations={setAllAnnotations}
              groupMembers={groupMembers}
            />
            <IdeaSpacesChannel
              width={channelPositions.ideaspaces.width}
              left={channelPositions.ideaspaces.left}
              opacity={channelPos.ideaspaces.opacity}
              annotationsBeingDragged={annotationsBeingDragged}
              setAnnotationsBeingDragged={setAnnotationsBeingDragged}
              toAnnotationsTile={toAnnotationsTile}
              allAnnotations={allAnnotations}
              setAlerts={setAlerts}
            />
          </div>
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
