/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Router from 'next/router';
import ReactHtmlParser from 'react-html-parser';
import {
  ArrowClockwise,
  BookmarkFill,
  ChatRightQuoteFill,
  PeopleFill,
  PersonFill,
  PersonPlusFill,
  ShieldLockFill,
  FileEarmarkFill,
  CalendarEventFill,
  ChevronRight,
} from 'react-bootstrap-icons';

import {
  OverlayTrigger, Popover, Modal, Button, Form,
} from 'react-bootstrap';

import { fetchSharedAnnotationsOnDocument, getAllAnnotations } from '../../utils/annotationUtil';
import { fixIframes } from '../../utils/parseUtil';

import PermissionsButtonGroup from '../PermissionsButtonGroup';
import {
  ListLoadingSpinner, EmptyListMessage,
} from './HelperComponents';

import AnnotationTile from './AnnotationTile';

import styles from './DashboardChannels.module.scss';
import { DeepCopyObj, RID } from '../../utils/docUIUtils';
import TileBadge from '../TileBadge';
import ISFilterButton from '../IdeaSpaceComponents/ISFilterButton';
import OutlineTile from './OutlineTile';
import {
  byPermissionsIdeaSpaceFilterMatch,
  annotatedByFilterMatch,
  byTagFilterMatch,
  byGroupFilterMatch,
  byDocumentFilterMatch,
} from '../../utils/annotationFilteringUtil';
import ISGroupHeader from '../IdeaSpaceComponents/ISGroupHeader/ISGroupHeader';

export default function AnnotationsChannel({
  session,
  slug,
  setAlerts,
  maxNumberOfAnnotationTags = 3,
  width,
  left,
  opacity,
  mode,
  selectedDocumentId,
  selectedGroupId,
  selectedDocumentSlug,
  documentPermissions,
}) {
  const [selectedPermissions, setSelectedPermissions] = useState('shared');
  const [outlineOpen, setOutlineOpen] = useState();
  const [listLoading, setListLoading] = useState();
  // for AS annotations
  const [annotations, setAnnotations] = useState({});
  // for IS annotations
  const [allAnnotations, setAllAnnotations] = useState();
  const aa = allAnnotations || [];
  const [groupedAnnotations, setGroupedAnnotations] = useState({});
  const [filteredAnnotations, setFilteredAnnotations] = useState([]);

  const [activeISGroupHeaders, setActiveISGroupHeaders] = useState([]);

  const [refresh, setRefresh] = useState();
  const [recalculateAllFilterNumbers, setRecalculateAllFilterNumbers] = useState();
  const [allFilters, setAllFilters] = useState({
    byPermissions: {
      private: false,
      privateNumber: 0,
      shared: false,
      sharedNumber: 0,
    },
    annotatedBy: {},
    byGroup: {},
    byDocument: {},
    byTag: {},
    byDateCreated: { start: undefined, end: undefined },
  });
  const [appliedFilters, setAppliedFilters] = useState({
    byPermissions: { private: false, shared: false },
    annotatedBy: [],
    byGroup: [],
    byDocument: [],
    byTag: [],
  });
  const [tab, setTab] = useState('annotations');
  const [showNewOutlineModal, setShowNewOutlineModal] = useState();

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, forceUpdateForRefresh] = useState();
  const dashboardState = `${selectedDocumentId !== undefined && selectedDocumentSlug !== undefined ? `did=${selectedDocumentId}&slug=${selectedDocumentSlug}&dp=${documentPermissions}&` : ''}gid=${selectedGroupId}`;

  const filterIcons = {
    byPermissions: <ShieldLockFill size={14} style={{ marginRight: 4 }} />,
    annotatedBy: <ChatRightQuoteFill size={14} style={{ marginRight: 4 }} />,
    byGroup: <PeopleFill size={14} style={{ marginRight: 4 }} />,
    byDocument: <FileEarmarkFill size={14} style={{ marginRight: 4 }} />,
    byTag: <BookmarkFill size={14} style={{ marginRight: 4 }} />,
    byDateCreated: <CalendarEventFill size={14} style={{ marginRight: 4 }} />,
  };

  const byPermissionFilter = ({ email, permissions, filter }) => {
    if (filter === 'mine') { // mine
      return session.user.email === email;
    }

    if (filter === 'shared') { // shared
      return !permissions.private && !permissions.sharedTo;
    }

    if (filter === 'shared-with-me' && permissions.sharedTo !== undefined) { // shared with specific people
      return permissions.sharedTo.includes(session.user.id);
    }
    return false;
  };

  const buttons = [
    {
      text: 'Mine',
      textWidth: 40,
      count: annotations[slug] === undefined ? 0 : annotations[slug].mine.length,
      selected: selectedPermissions === 'mine',
      onClick: () => { setSelectedPermissions('mine'); },
      icon: <PersonFill size="1.2em" />,
    },
    {
      text: 'Shared with group(s)',
      textWidth: 145,
      count: annotations[slug] === undefined ? 0 : annotations[slug].shared.length,
      selected: selectedPermissions === 'shared',
      onClick: () => { setSelectedPermissions('shared'); },
      icon: <PeopleFill size="1.2em" />,
    },
    {
      text: 'Shared with me',
      textWidth: 115,
      count: annotations[slug] === undefined ? 0 : annotations[slug]['shared-with-me'].length,
      selected: selectedPermissions === 'shared-with-me',
      onClick: () => { setSelectedPermissions('shared-with-me'); },
      icon: <PersonPlusFill size="1.2em" />,
    },
  ];

  const toAnnotationsTile = ({
    _id, permissions, target, creator: { name }, modified, body: { value, tags },
  }) => (
    <AnnotationTile
      key={_id}
      onClick={() => Router.push(`/documents/${slug}?mine=${permissions.private ? 'true' : 'false'}&aid=${_id}&${dashboardState}`)}
      text={target.selector.exact}
      author={name}
      annotation={value.length > 0 ? ReactHtmlParser(value, { transform: fixIframes }) : ''}
      activityDate={modified}
      tags={tags}
      maxNumberOfAnnotationTags={maxNumberOfAnnotationTags}
    />
  );

  const updateAnnotations = (annos) => {
    annotations[slug] = annos;
    setAnnotations(annotations);
  };

  const filterAnnotations = (f) => {
    const annotationMatchesFilters = (a) => (
      byPermissionsIdeaSpaceFilterMatch(a.permissions, f.byPermissions)
    && byGroupFilterMatch(a.target.document.groups, f.byGroup)
    && byDocumentFilterMatch(a.target.document.id, f.byDocument)
    && annotatedByFilterMatch(a.creator.id, f.annotatedBy)
      && byTagFilterMatch(a.body.tags, f.byTag));

    const filteredAnnos = [];
    if (appliedFilters.byGroup.length === 0) {
      // this means that we have to filter all annotations to generate the list of annotations
      // that match the filter

      aa.map((a, i) => {
        if (annotationMatchesFilters(a)) {
          filteredAnnos.push(i);
        }
        return null;
      });
    } else {
      // this means there are specific groups that we only have to look at and not all annotations
      appliedFilters.byGroup.map((gid) => {
        groupedAnnotations[gid].map((index) => {
          if (!filteredAnnos.includes(index) && annotationMatchesFilters(aa[index])) {
            filteredAnnos.push(index);
          }
          return null;
        });
        return null;
      });
    }

    return filteredAnnos;
  };

  const saveAndOrganizeAnnotationsByGroup = (as) => {
    const annos = as.sort((a, b) => new Date(b.modified) - new Date(a.modified));
    const groupedAnnos = { privateGroup: [] };
    // 'af' stands for 'all filters'. we are generating all filters possible for all annotations
    const af = {
      byPermissions: {
        private: false, privateNumber: 0, shared: false, sharedNumber: 0,
      },
      annotatedBy: {},
      byGroup: {},
      byDocument: {},
      byTag: {},
      byDateCreated: { start: undefined, end: undefined },
    };
    annos.map(({
      creator, created, target: { document: { groups, id: did, title } }, body: { tags },
    }, i) => {
      // populating all filters object
      if (af.annotatedBy[creator.id] === undefined) {
        af.annotatedBy[creator.id] = {
          name: creator.name,
          number: 0,
          checked: allFilters.annotatedBy[creator.id] && allFilters.annotatedBy[creator.id].checked,
        };
      }

      if (af.byDocument[did] === undefined) {
        af.byDocument[did] = {
          name: title,
          number: 0,
          checked: allFilters.byDocument[did] && allFilters.byDocument[did].checked,
        };
      }

      tags.map((t) => {
        if (af.byTag[t] === undefined) {
          af.byTag[t] = {
            name: t,
            number: 0,
            checked: allFilters.byTag[t] && allFilters.byTag[t].checked,
          };
        }
        return null;
      });

      const dateCreated = new Date(created);

      if (dateCreated < af.byDateCreated.start || af.byDateCreated.start === undefined) {
        af.byDateCreated.start = dateCreated;
      }

      if (dateCreated < af.byDateCreated.end || af.byDateCreated.end === undefined) {
        af.byDateCreated.end = dateCreated;
      }


      if (groups.length === 0) {
        groupedAnnos.privateGroup.push(i);
        return null;
      }

      groups.map((gid) => {
        if (af.byGroup[gid] === undefined) {
          const g = gid === 'privateGroup' ? { name: 'Private' } : session.user.groups.find(({ id }) => id === gid);
          af.byGroup[gid] = { name: g.name, number: 5 };
        }

        if (groupedAnnos[gid] === undefined) {
          groupedAnnos[gid] = [];
        }
        groupedAnnos[gid].push(i);
        return null;
      });
      return null;
    });
    setAllAnnotations(annos);
    setGroupedAnnotations(groupedAnnos);
    setAllFilters(af);
    setRecalculateAllFilterNumbers(true);
  };

  const toggleFilters = (type, key) => {
    if (type === 'byPermissions') {
      allFilters.byPermissions[key] = !allFilters.byPermissions[key];
      appliedFilters.byPermissions[key] = allFilters.byPermissions[key];
    } else {
      allFilters[type][key].checked = !allFilters[type][key].checked;
      if (allFilters[type][key].checked) {
        appliedFilters[type].push(key);
      } else {
        appliedFilters[type] = appliedFilters[type].filter((k) => k !== key);
      }
    }

    setAllFilters(DeepCopyObj(allFilters));
    setAppliedFilters(DeepCopyObj(appliedFilters));
    setRecalculateAllFilterNumbers(true);
    // when the applied filters change we will collapse all ISGroupHeaders because we have a new
    // set of results
    setActiveISGroupHeaders([]);
  };

  const generateFilters = () => {
    let firstFilter = true;
    const tileBadgeFilters = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [type, arr] of Object.entries(appliedFilters)) {
      if (type === 'byPermissions') {
        if (arr.private || arr.shared) {
          tileBadgeFilters.push(
            <TileBadge
              key="permissionsTileBadgeFilter"
              icon={filterIcons[type]}
              color="blue"
              text={arr.private ? 'Private' : 'Shared With Group(s)'}
              marginLeft={!firstFilter ? 5 : 0}
              onDelete={() => toggleFilters(type, arr.private ? 'private' : 'shared')}
              fontSize={12}
            />,
          );
        }
      } else {
        // eslint-disable-next-line no-loop-func
        tileBadgeFilters.push(arr.map((key) => {
          const tileBadgeFilter = (
            <TileBadge
              key={key}
              icon={filterIcons[type]}
              color="blue"
              text={allFilters[type][key].name}
              marginLeft={!firstFilter ? 5 : 0}
              onDelete={() => toggleFilters(type, key)}
              fontSize={12}
            />
          );
          firstFilter = false;
          return tileBadgeFilter;
        }));
      }
    }

    return tileBadgeFilters;
  };

  const toggleISGroupHeader = (gid) => {
    let newActiveISGroupHeaders = [];
    if (activeISGroupHeaders.includes(gid)) {
      newActiveISGroupHeaders = activeISGroupHeaders.filter((groupId) => groupId !== gid);
    } else {
      newActiveISGroupHeaders = activeISGroupHeaders.concat([gid]);
    }

    setActiveISGroupHeaders(newActiveISGroupHeaders);
  };

  const fetchAllAnnotations = async () => {
    if (session) {
      setListLoading(true);
      if (session && (session.user.groups || session.user.id)) {
        await getAllAnnotations({
          groups: session.user.groups, userId: session.user.id,
        })
          .then(async (data) => {
            saveAndOrganizeAnnotationsByGroup(data.annotations);
            setRefresh();
            setLastUpdated(new Date());
            setListLoading(false);
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      }
    }
  };

  useEffect(
    () => setFilteredAnnotations(filterAnnotations(appliedFilters)),
    [allAnnotations, groupedAnnotations, appliedFilters],
  );

  useEffect(() => {
    // user refreshing idea space
    if (refresh && mode === 'is') {
      fetchAllAnnotations();
      return;
    }

    // user refreshing annotations dashboard or changing document slug
    if (slug === undefined) {
      setSelectedPermissions('shared');
      return;
    }

    if (annotations[slug] !== undefined && !refresh) {
      // we already have the annotations for this document so we don't need to reload that
      // information
      return;
    }

    setListLoading(true);
    fetchSharedAnnotationsOnDocument({ slug, prefetch: false })
      .then((annos) => {
        const sortedAnnos = annos.sort((a, b) => new Date(b.modified) - new Date(a.modified));
        const a = {
          mine: sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'mine' })).map((anno) => toAnnotationsTile(anno)),
          shared: sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'shared' })).map((anno) => toAnnotationsTile(anno)),
          'shared-with-me': sortedAnnos.filter(({ creator: { email }, permissions }) => byPermissionFilter({ email, permissions, filter: 'shared-with-me' })).map((anno) => toAnnotationsTile(anno)),
        };

        updateAnnotations(a);
        setListLoading();
        setRefresh();
        setLastUpdated(new Date());

        if (a.shared.length === 0 && a.mine.length > 0) {
          setSelectedPermissions('mine');
        } else {
          setSelectedPermissions('shared');
        }
      }).catch((err) => {
        setAlerts([{ text: err.message, variant: 'danger' }]);
        setListLoading();
        setRefresh();
        setLastUpdated(new Date());
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, refresh]);

  useEffect(() => {
    // this keeps the refresh popover text up-to-date
    setInterval(() => forceUpdateForRefresh(RID()), 60 * 1000);
  }, []);

  useEffect(() => {
    if (mode === 'as') {
      setTab('annotations');
    } else if (mode === 'is' && allAnnotations === undefined) {
      fetchAllAnnotations();
    }
  }, [mode]);

  useEffect(() => {
    if (!recalculateAllFilterNumbers) {
      return;
    }

    const af = DeepCopyObj(allFilters);

    const permissionsTempFilter = DeepCopyObj(appliedFilters);
    permissionsTempFilter.byPermissions = { private: true, shared: false };
    af.byPermissions.privateNumber = filterAnnotations(permissionsTempFilter).length;
    permissionsTempFilter.byPermissions = { private: false, shared: true };
    af.byPermissions.sharedNumber = filterAnnotations(permissionsTempFilter).length;

    const annotatedByTempFilter = DeepCopyObj(appliedFilters);
    Object.keys(af.annotatedBy).map((creatorId) => {
      annotatedByTempFilter.annotatedBy = [creatorId];
      af.annotatedBy[creatorId].number = filterAnnotations(annotatedByTempFilter).length;
      return null;
    });

    const byGroupTempFilter = DeepCopyObj(appliedFilters);
    Object.keys(af.byGroup).map((groupId) => {
      byGroupTempFilter.byGroup = [groupId];
      af.byGroup[groupId].number = filterAnnotations(byGroupTempFilter).length;
      return null;
    });

    const byDocumentTempFilter = DeepCopyObj(appliedFilters);
    Object.keys(af.byDocument).map((documentId) => {
      byDocumentTempFilter.byDocument = [documentId];
      af.byDocument[documentId].number = filterAnnotations(byDocumentTempFilter).length;
      return null;
    });

    const byTagTempFilter = DeepCopyObj(appliedFilters);
    Object.keys(af.byTag).map((t) => {
      byTagTempFilter.byTag = [t];
      af.byTag[t].number = filterAnnotations(byTagTempFilter).length;
      return null;
    });

    setAllFilters(af);
    setRecalculateAllFilterNumbers();
  }, [recalculateAllFilterNumbers]);


  let annotationTiles = [];

  if (mode === 'as') {
    if (slug === undefined) {
      annotationTiles = <EmptyListMessage text="No document selected" />;
    } else if (annotations[slug] === undefined) {
      annotationTiles = <EmptyListMessage />;
    } else if (annotations[slug][selectedPermissions].length === 0) {
      annotationTiles = <EmptyListMessage />;
    } else {
      annotationTiles = annotations[slug][selectedPermissions];
    }
  } else if (mode === 'is') {
    // eslint-disable-next-line no-restricted-syntax
    for (const [gid, annosIndexes] of Object.entries(groupedAnnotations)) {
      if ((appliedFilters.byGroup.length > 0 && appliedFilters.byGroup.includes(gid))
      || appliedFilters.byGroup.length === 0) {
        const aTiles = annosIndexes.map((i) => {
          if (filteredAnnotations.includes(i)) {
            return toAnnotationsTile(aa[i]);
          }
          return null;
        }).filter((t) => t !== null);
        if (aTiles.length > 0) {
          const g = gid === 'privateGroup' ? { name: 'Private' } : session.user.groups.find(({ id }) => id === gid);
          annotationTiles.push(
            <ISGroupHeader
              key={`${gid}-isgroupheader`}
              name={g ? g.name : ''}
              numberOfAnnotations={aTiles.length}
              active={activeISGroupHeaders.includes(gid)}
              toggle={() => toggleISGroupHeader(gid)}
            >
              {aTiles}
            </ISGroupHeader>,
          );
        }
      }
    }
    if (annotationTiles.length === 0) {
      annotationTiles = <EmptyListMessage text="0 Annotations Found" />;
    }
  }


  const annotationsTabSelected = tab === 'annotations';

  const tabSelectionLineOpacity = mode === 'is' ? 1 : 0;
  const tabSelectionLine = (
    <div
      className={styles.tabSelectionLine}
      style={annotationsTabSelected ? { width: 'calc(60% - 9px)', left: 0, opacity: tabSelectionLineOpacity } : { width: 'calc(40% + 9px)', left: 'calc(60% - 9px)', opacity: tabSelectionLineOpacity }}
    />
  );

  const tabContent = {
    annotations:
  <>
    {mode === 'is' && (
    <div className={styles.filtersContainer}>
      {generateFilters()}
    </div>
    )}
    <div className={styles.tileContainer}>
      {(listLoading || refresh) ? <ListLoadingSpinner /> : annotationTiles}
    </div>
  </>,
    outlines: outlineOpen ? <div>Open Outline</div>
      : (
        <div className={styles.tileContainer}>
          <OutlineTile
            name="Outline Name"
            activityDate={new Date()}
            onClick={() => setOutlineOpen(true)}
          />
        </div>
      ),
  };

  return (
    <>
      <div className={styles.channelContainer} style={{ width, left, opacity }}>
        {mode === 'is' && <div className={styles.dividingLine} />}
        <div
          className={styles.headerContainer}
          style={{
            borderBottom: '1px solid',
            borderColor: mode === 'as' ? 'transparent' : '#DADCE1',
            paddingRight: mode === 'as' ? 20 : 10,
          }}
        >
          {tabSelectionLine}
          <div style={{ display: 'flex', flex: 3 }}>
            <div style={{ display: 'flex', flex: 1 }}>
              <span
                onClick={() => setTab('annotations')}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="button"
                className={styles.headerText}
                style={{ color: annotationsTabSelected ? '#424242' : '#ABABAB' }}
              >
                Annotations
              </span>
            </div>
            <OverlayTrigger
              key="refresh-annotaitons"
              placement="bottom"
              overlay={(
                <Popover
                  id="popover-basic"
                >
                  <Popover.Content style={{ color: '#636363' }}>{`Refreshed ${moment(lastUpdated).fromNow()}`}</Popover.Content>
                </Popover>
            )}
            >
              <div
                className={styles.refreshButton}
                onClick={() => setRefresh(true)}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="button"
              >
                <span style={{ fontSize: 'inherit' }}>Refresh</span>
                <ArrowClockwise size={18} style={{ margin: 'auto 5px' }} />
              </div>
            </OverlayTrigger>
            {mode === 'as'
              ? <PermissionsButtonGroup buttons={buttons} />
              : (
                <ISFilterButton
                  active={annotationsTabSelected}
                  total={aa.length}
                  result={filteredAnnotations.length}
                  toggleFilters={toggleFilters}
                  filters={allFilters}
                />
              )}
          </div>
          {mode === 'is' && (
          <div
            style={{
              display: 'flex',
              flex: 2,
              borderLeft: '1px solid #DADCE1',
              marginLeft: 8,
              paddingLeft: 8,
              alignItems: 'center',
              color: !annotationsTabSelected ? '#424242' : '#ABABAB',
            }}
          >
            <span
              onClick={() => {
                if (tab === 'outlines') {
                  setOutlineOpen();
                } else {
                  setTab('outlines');
                }
              }}
              onKeyDown={() => {}}
              tabIndex={-1}
              role="button"
              className={styles.headerText}
            >
              Outlines
            </span>
            {outlineOpen ? (
              <div
                style={{ display: 'flex', flex: 1, alignItems: 'center' }}
                onClick={() => {
                  if (tab === 'outlines') {
                    setOutlineOpen();
                  } else {
                    setTab('outlines');
                  }
                }}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="button"
              >
                <ChevronRight size={14} />
                <input
                  style={{ color: !annotationsTabSelected ? '#424242' : '#ABABAB' }}
                  className={styles.titleInput}
                  type="text"
                  value="hello and goodbye"
                />
              </div>
            )
              : (
                <TileBadge
                  text="New + "
                  color={!annotationsTabSelected ? 'yellow' : 'grey'}
                  onClick={() => {
                    setShowNewOutlineModal(true);
                    setTab('outlines');
                  }}
                />
              )}

          </div>
          )}
        </div>
        {tabContent[tab]}
      </div>
      <Modal
        show={showNewOutlineModal}
        onHide={() => setShowNewOutlineModal()}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Outline</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="exampleForm.ControlInput1">
              <Form.Control type="email" placeholder="name of outline" />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNewOutlineModal()}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowNewOutlineModal()}>Create</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
