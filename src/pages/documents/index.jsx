/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useSession } from 'next-auth/client';
import {
  Spinner, Badge, Modal, Button,
} from 'react-bootstrap';
import {
  Folder2Open,
  PencilFill,
  PersonFill, Plus, Search, X,
} from 'react-bootstrap-icons';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import {
  getSharedDocumentsByGroup,
  getDocumentsByUser,
  deleteDocumentById,
  // getDocumentsByGroupByUser,
} from '../../utils/docUtil';
import Table from '../../components/Table';
import TileBadge from '../../components/TileBadge';
import NewPlusButton from '../../components/NewPlusButton';
import PermissionsButtonGroup from '../../components/PermissionsButtonGroup';
import { getGroupsByGroupIds } from '../../utils/groupUtil';
import styles from './index.module.scss';
import { escapeRegExp } from '../../utils/stringUtil';

const DocumentsIndex = ({
  props,
  query,
  statefulSession,
}) => {
  const router = useRouter();
  const dashboardState = `${query.did !== undefined && query.slug !== undefined ? `did=${query.did}&slug=${query.slug}&dp=${query.dp}&` : ''}gid=${query.gid}`;

  const { tab, initAlert } = props;
  const [session, loading] = useSession();
  const tabToUse = tab || 'shared';
  // const isPrivateGroup = query && query.gid === 'privateGroup';

  const [key, setKey] = useState(tabToUse);
  const [groupNamesObj, setGroupNamesObj] = useState();
  const [mineDocuments, setMineDocuments] = useState();
  const [sharedDocuments, setSharedDocuments] = useState();
  // eslint-disable-next-line no-unused-vars
  const [refresh, setRefresh] = useState(new Date());

  const [documentToDelete, setDocumentToDelete] = useState();

  const [listLoading, setListLoading] = useState(true);
  const alertArray = initAlert ? [initAlert] : [];
  const [alerts, setAlerts] = useState(alertArray);

  const [searchQuery, setSearchQuery] = useState('');
  const [clearSearchHovered, setClearSearchHovered] = useState();
  const [rowDeleteHovered, setRowDeleteHovered] = useState();

  const transition = 'all 0.5s';

  /*
  // let breadcrumbs;
  // const validGroupId = false;
  if (session !== undefined && query) {
    const group = session.user.groups.find(({ id }) => id === query.gid);
    validGroupId = group !== undefined || query.gid === 'privateGroup';
    if (group !== undefined) {
      breadcrumbs = [
        { name: group.name, href: `/groups/${query.gid}` },
        { name: 'Documents' },
      ];
    } else if (validGroupId) {
      // the only way group can be undefined but still be a validGroupId is if it is the psuedo
      // privateGroup
      breadcrumbs = [
        { name: 'Personal' },
        { name: 'Documents' },
      ];
    }

  } */

  const filterDocuments = ({
    title, contributors, groups, state,
  }) => {
    // eslint-disable-next-line no-useless-escape
    const r = searchQuery ? new RegExp(`\.\*${escapeRegExp(searchQuery)}\.\*`, 'i') : new RegExp('\.\*', 'i');
    if (title.search(r) !== -1
      || state.search(r) !== -1
      || contributors.some(({ name }) => name.search(r) !== -1)
    ) { return true; }

    if (groups.length === 0) {
      // this means that this document is a part of the pseudo group Personal
      return 'Personal'.search(r) !== -1;
    }

    return groupNamesObj && groups.some((id) => (groupNamesObj[id] || '').search(r) !== -1);
  };

  const documents = key === 'mine' ? mineDocuments : sharedDocuments;
  const queriedDocuments = Array.isArray(documents) ? documents.filter(filterDocuments) : undefined;

  const contributorsListToContributorsContent = (members) => {
    const contributors = {};

    for (let i = 0; i < members.length; i += 1) {
      const { name, type } = members[i];
      if (name.length > 0) {
        if (contributors[type]) {
          contributors[type].push(name);
        } else {
          contributors[type] = [name];
        }
      }
    }

    const orderOfContributions = {
      author: 1, editor: 2, translator: 3, contributor: 4,
    };
    const content = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [type, names] of Object.entries(contributors)) {
      content[orderOfContributions[type.toLowerCase()]] = (
        <div style={{ fontSize: 14, marginBottom: 5, lineHeight: '17px' }}>
          <div style={{ fontWeight: 500, color: '#616161' }}>{`${type}${names.length > 1 ? 's' : ''}`}</div>
          <div>{names.join(', ')}</div>
        </div>
      );
    }
    if (content.length === 0) { return undefined; }
    return <>{content}</>;
  };

  const groupsToTileBadges = (groups) => (
    groups && groups.length > 0
      ? groups.map((id) => (
        <TileBadge
          key={`group-tile-badge-${id}`}
          color="grey"
          marginRight={5}
          text={groupNamesObj && groupNamesObj[id]}
        />
      )) : (<Badge>[&quot;Personal&quot; - no groups ]</Badge>));

  const deleteDocument = (event) => {
    setListLoading(true);
    event.target.setAttribute('disabled', 'true');
    deleteDocumentById(documentToDelete._id).then(() => {
      if (key === 'mine') {
        setMineDocuments(mineDocuments.filter((d) => d._id !== documentToDelete._id));
      } else {
        setSharedDocuments(sharedDocuments.filter((d) => d._id !== documentToDelete._id));
      }
      setDocumentToDelete();
      setAlerts((prevState) => [...prevState, {
        text: 'You have successfully deleted the document.',
        variant: 'warning',
      }]);
      setListLoading(false);
    }).catch((err) => {
      setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      setListLoading(false);
    });
  };

  const spacer = (
    <div
      style={{
        width: 100, height: 6, borderRadius: 3, backgroundColor: '#eeeeee', margin: '0px auto', color: 'transparent',
      }}
    >
      .
    </div>
  );

  /*
  // Im keeping this code because how it utilized validGroupId to grab specific documents
  const fetchData = async () => {
    if (session) {
      setListLoading(true);
      if (validGroupId) {
        if (key === 'shared') {
          await getDocumentsByGroupByUser({
            groups: [{ id: query.gid }],
            page,
            perPage,
            mine: false,
          })
            .then(async (data) => {
              const { count, docs } = data;
              setTotalPages(Math.ceil((count) / perPage));
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(docsWithGroupNames);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        } else if (key === 'mine') {
          await getDocumentsByGroupByUser({
            groups: query.gid === 'privateGroup' ? [] : [{ id: query.gid }],
            id: session.user.id,
            page,
            perPage,
            mine: true,
          })
            .then(async (data) => {
              const { count, docs } = data;
              setTotalPages(Math.ceil((count) / perPage));
              await addGroupNamesToDocuments(docs)
                .then((docsWithGroupNames) => {
                  setDocuments(docsWithGroupNames);
                });
            })
            .catch((err) => {
              setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
              setListLoading(false);
            });
        }
      } else if (key === 'shared') {
        await getSharedDocumentsByGroup({ groups: session.user.groups, page, perPage })
          .then(async (data) => {
            const { count, docs } = data;
            setTotalPages(Math.ceil((count) / perPage));
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                setDocuments(docsWithGroupNames);
              });
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      } else if (key === 'mine') {
        await getDocumentsByUser({ id: session.user.id, page, perPage })
          .then(async (data) => {
            const { count, docs } = data;
            setTotalPages(Math.ceil((count) / perPage));
            await addGroupNamesToDocuments(docs)
              .then((docsWithGroupNames) => {
                setDocuments(docsWithGroupNames);
              });
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      }
    }
  };
  */

  useEffect(() => {
    if (session?.user?.id) {
      if (key === 'mine' && (mineDocuments === undefined || refresh)) {
        setListLoading(true);
        getDocumentsByUser({ id: session.user.id })
          .then(({ docs }) => {
            setMineDocuments(docs);
            setListLoading(false);
          }).catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      } else if (key === 'shared' && (sharedDocuments === undefined || refresh)) {
        getSharedDocumentsByGroup({ groups: session.user.groups })
          .then(async ({ docs }) => {
            setSharedDocuments(docs);
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      }
    }
  }, [key, session, refresh]);

  useEffect(() => {
    if (session?.user) {
      const groupIds = session.user.groups.map(({ id }) => id);
      getGroupsByGroupIds(groupIds)
        .then((res) => {
          const grpNamesObj = {};
          res.map(({ _id, name }) => {
            grpNamesObj[_id] = name;
            return null;
          });
          setGroupNamesObj(grpNamesObj);
        })
        .catch((err) => {
          setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        });
    }
  }, [session]);

  return (
    <Layout
      alerts={alerts}
      type="document"
      statefulSession={statefulSession}
      dashboardState={dashboardState}
    >
      {!loading && !session && (
        <UnauthorizedCard />
      )}
      {loading && <LoadingSpinner />}
      {session && !loading && (
      <>
        <div style={{ height: 'calc(100vh - 234px)', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            fontSize: 26, fontWeight: 300, marginBottom: 35, display: 'flex', flexDirection: 'row', alignItems: 'center',
          }}
          >
            <div>Documents</div>
            <NewPlusButton href="/documents/new" />
            <span style={{ flex: 1 }} />
            <PermissionsButtonGroup
              buttons={[
                {
                  text: 'Mine',
                  textWidth: 40,
                  count: key === 'mine' ? mineDocuments?.length : undefined,
                  queryCount: key === 'mine' ? queriedDocuments?.length : undefined,
                  selected: key === 'mine',
                  onClick: () => setKey('mine'),
                  icon: <PersonFill size="1.2em" />,
                },
                {
                  text: 'Shared',
                  textWidth: 52,
                  count: key === 'shared' ? sharedDocuments?.length : undefined,
                  queryCount: key === 'shared' ? queriedDocuments?.length : undefined,
                  selected: key === 'shared',
                  onClick: () => setKey('shared'),
                  icon: <PersonFill size="1.2em" />,
                },
              ]}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{
              transition,
              display: 'flex',
              flexDirection: 'row',
              flex: 1,
              height: 38,
              alignItems: 'center',
              borderRadius: 8,
              border: `1px solid ${clearSearchHovered ? '#E20101' : '#bdbdbd'}`,
              backgroundColor: '#fcfcfc',
              marginBottom: 20,
            }}
            >
              <Search size={16} color="#424242" style={{ marginLeft: 14, marginRight: 8 }} />
              <input
                style={{
                  flex: 1,
                  height: 36,
                  border: 'none',
                  outline: 'none',
                  padding: '0px 8px',
                  backgroundColor: 'transparent',
                  fontStyle: searchQuery.length > 0 ? 'normal' : 'italic',
                }}
                placeholder="Search Documents (title, contributors, groups, status)"
                onChange={(ev) => setSearchQuery(ev.target.value)}
                value={searchQuery}
              />
              <div
                style={{
                  transition,
                  cursor: 'pointer',
                  height: 36,
                  width: 36,
                  borderRadius: '0px 8px 8px 0px',
                  color: clearSearchHovered ? '#E20101' : '#424242',
                  backgroundColor: clearSearchHovered ? '#FCECEB' : '#eeeeee',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={() => setClearSearchHovered(true)}
                onMouseLeave={() => setClearSearchHovered()}
                onClick={() => setSearchQuery('')}
              >
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </div>
            </div>
          </div>
          {queriedDocuments ? (
            <Table
              key="groups-table"
              id="groups-table"
              height="100vh - 380px"
              loading={listLoading}
              columnHeaders={[
                { header: 'TITLE', flex: 6 },
                { header: 'CONTRIBUTORS', flex: 3 },
                { header: 'GROUPS', flex: 4 },
                { header: 'STATUS', flex: 2 },
                { header: 'CREATED', flex: 3 },
              ]}
              rows={queriedDocuments.map(({
                _id, title, contributors, slug, state, createdAt, owner, groups,
              }) => ({
                key: `queried-documents-${_id}`,
                href: session.user.id === owner ? `/documents/${slug}/edit` : undefined,
                deleteHovered: _id === rowDeleteHovered,
                columns: [
                  {
                    content: (title && (
                    <>
                      <span>{title}</span>
                      {session.user.id === owner && <PencilFill show-on-hover="true" style={{ marginLeft: 4, position: 'relative', top: -2 }} size={14} />}
                    </>
                    ))
                      || 'undefined',
                    style: { fontWeight: 400 },
                    highlightOnHover: session.user.id === owner,
                    slideOnHover: {
                      leftDisplacement: 45,
                      leftContent: {
                        style: { position: 'absolute', height: '100%' },
                        html: (
                          <div
                            className={styles.openDocumentSlideBtn}
                            onClick={() => router.push({ pathname: `/documents/${slug}` })}
                          >
                            <div style={{ textAlign: 'center' }}>Open</div>
                            <Folder2Open size={18} />
                          </div>
                        ),
                      },
                    },
                  },
                  { content: contributorsListToContributorsContent(contributors) || '-', style: { color: '#86919D' } },
                  { content: groupsToTileBadges(groups) || '-', style: { color: '#86919D' } },
                  { content: state || '-', style: { color: '#86919D' } },
                  { content: (createdAt && moment(createdAt).format('MMM DD, YYYY')) || '-', style: { color: '#86919D' } },
                ],
                hoverContent: session?.user?.id === owner && (
                // eslint-disable-next-line jsx-a11y/interactive-supports-focus
                <div
                  style={{
                    position: 'absolute',
                    top: 15,
                    right: 20,
                    height: 32,
                    width: 32,
                    borderRadius: 4,
                    backgroundColor: '#FCECEB',
                    color: '#E20101',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  role="button"
                  onClick={() => setDocumentToDelete({ _id, title })}
                  onMouseEnter={() => setRowDeleteHovered(_id)}
                  onMouseLeave={() => setRowDeleteHovered()}
                >
                  <X size={24} />
                </div>
                ),
                moreOptions: [
                  { text: 'Manage', onClick: () => {} },
                  { text: 'Delete', onClick: () => {} },
                  { text: 'Archive', onClick: () => {} },
                ],
              }))}
            />
          ) : <Spinner />}

        </div>
        <Modal
          id="delete-document-modal"
          size="lg"
          show={documentToDelete !== undefined}
          onHide={() => setDocumentToDelete()}
        >
          <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div style={{
                flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
              }}
              >
                Delete Document
              </div>
              <div className={styles.cancelUploadBtn} onClick={() => setDocumentToDelete()}>
                <X size={20} />
              </div>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'column', marginTop: 15, marginBottom: 30, padding: 15,
            }}
            >
              <div style={{
                fontSize: 20, fontWeight: 400, color: '#757575', marginBottom: 20, padding: '3px 8px', border: '1px solid #eeeeee', borderRadius: 4, backgroundColor: '#fafafa',
              }}
              >
                <span>
                  &quot;
                  {documentToDelete?.title}
                  &quot;
                </span>
              </div>
              {spacer}
              <div style={{ fontWeight: 'bold', color: '#494949', marginTop: 20 }}>Are you sure you want to delete this document permanently?</div>
              <div style={{ color: '#494949' }}>This action cannot be undone.</div>
              <div style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
                <Button
                  variant="danger"
                  onClick={deleteDocument}
                >
                  Yes, delete this document
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </>
      )}
    </Layout>
  );
};

DocumentsIndex.getInitialProps = async (context) => {
  const { tab, alert } = context.query;
  let props = {};
  if (tab) props = { ...props, tab };
  if (alert && ['editedDocument', 'createdDocument', 'deletedDocument'].includes(alert)) {
    let text = '';
    switch (alert) {
      case 'editedDocument': text = 'Document edited successfully.'; break;
      case 'createdDocument': text = 'Document created successfully.'; break;
      case 'deletedDocument': text = 'Document deleted successfully.'; break;
      default: text = '';
    }
    const initAlert = {
      text,
      variant: alert === 'deletedDocument' ? 'warning' : 'success',
    };
    props = { ...props, initAlert };
  }
  return { props, query: context.query };
};

export default DocumentsIndex;
