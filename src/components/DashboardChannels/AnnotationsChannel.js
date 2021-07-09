/* eslint-disable no-underscore-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import Router, { useRouter } from 'next/router';
import debounce from 'lodash.debounce';
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
  CheckCircleFill,
} from 'react-bootstrap-icons';

import {
  OverlayTrigger, Popover, Modal, Button, Form, Tooltip, Spinner, ProgressBar,
} from 'react-bootstrap';

import {
  DEFAULTS_PARAGRAPH,
} from '@udecode/slate-plugins';
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
import ISOutline from '../IdeaSpaceComponents/ISOutline';
import {
  createOutline, getAllOutlines, updateOutlineData, deleteOutline, exportDocumentToAnnotationStudio,
} from '../../utils/outlineUtil';

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
  dashboardState = '',
  annotationsBeingDragged,
  setAnnotationsBeingDragged,
  allAnnotations,
  setAllAnnotations,
}) {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState('shared');
  const [listLoading, setListLoading] = useState();
  // for AS annotations
  const [annotations, setAnnotations] = useState({});
  const aa = allAnnotations || [];
  const [groupedAnnotations, setGroupedAnnotations] = useState({});
  const [filteredAnnotations, setFilteredAnnotations] = useState([]);

  const [applyDefaultFilters, setApplyDefaultFilters] = useState();

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

  // state variables for outlines tab
  const [showNewOutlineModal, setShowNewOutlineModal] = useState();
  const [showExportingDocumentModal, setShowExportingDocumentModal] = useState();
  const [exportingDocumentModalTitle, setExportingDocumentModalTitle] = useState('');
  const [newOutlineName, setNewOutlineName] = useState('');
  const [creatingOutline, setCreatingOutline] = useState();
  const [deletingOutline, setDeletingOutline] = useState();
  const [outlines, setOutlines] = useState([]);
  const [loadingOutlines, setLoadingOutlines] = useState();
  const [outlineToDelete, setOutlineToDelete] = useState();

  const openOutline = useRef({
    id: null,
    name: '',
    document: null,
  });

  const setOpenOutline = useRef(({
    id, name, document, callback = () => {},
  }) => {
    if (id !== undefined) {
      openOutline.current.id = id;
    }
    if (name !== undefined) {
      openOutline.current.name = name;
    }
    if (document !== undefined) {
      openOutline.current.document = document;
    }
    callback();
  }).current;

  const [, setForceUpdate] = useState();
  const forceUpdate = () => setForceUpdate(RID());
  const [outlineStatus, setOutlineStatus] = useState();

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [, forceUpdateForRefresh] = useState();

  const saveOutline = async (id, { name, document }, callback = () => {}) => {
    await updateOutlineData({
      id,
      name,
      document,
    })
      .then(async (res) => {
        callback(res.value);
      })
      .catch(() => {
        setOutlineStatus('error');
      });
  };

  const saveOutlineDebounced = useRef(
    debounce(saveOutline, 2000),
  ).current;

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
    _id,
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
    };
    const {
      dbs,
      from,
      onDelete,
      onClick,
    } = extraInfo ? { ...defaultExtraInfo, ...extraInfo } : defaultExtraInfo;

    return (
      <AnnotationTile
        key={`${_id}-${from}`}
        id={_id}
        onClick={onClick || (() => Router.push(`/documents/${document.slug}?mine=${permissions.private ? 'true' : 'false'}&aid=${_id}&${dbs}`))}
        onDelete={onDelete}
        text={selector.exact}
        author={name}
        annotation={value.length > 0 ? ReactHtmlParser(value, { transform: fixIframes }) : ''}
        activityDate={modified}
        tags={tags}
        draggable
        maxNumberOfAnnotationTags={maxNumberOfAnnotationTags}
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

  const applyDefaultDashboardFilters = () => {
    // setting the applied filters to default filtering from Annotation Studio Dashboard
    // default setting can include a group ID filter and a document ID filter but must always
    // include a permissions filter either private or shared
    const appliedF = {
      byPermissions: selectedPermissions === 'mine'
        ? { private: true, shared: false }
        : { private: false, shared: true },
      annotatedBy: [],
      byGroup: selectedGroupId !== undefined ? [selectedGroupId] : [],
      byDocument: slug !== undefined ? [selectedDocumentId] : [],
      byTag: [],
    };

    if (selectedPermissions === 'shared') {
      allFilters.byPermissions.shared = false;
      allFilters.byPermissions.private = true;
    } else {
      allFilters.byPermissions.shared = true;
      allFilters.byPermissions.private = false;
    }

    if (selectedGroupId) {
      allFilters.byGroup[selectedGroupId].checked = true;
      // if we are applying default dashboard filters that means user is come from AS to IS and
      // they need to make sure they still see their annotations when moving from AS to IS
      setActiveISGroupHeaders([selectedGroupId]);
    }

    if (slug) {
      allFilters.byDocument[selectedDocumentId].checked = true;
    }

    setAllFilters(DeepCopyObj(allFilters));
    setAppliedFilters(appliedF);
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
        if (af.byGroup.privateGroup === undefined) {
          af.byGroup.privateGroup = { name: 'Private', number: 0, checked: false };
        }
        return null;
      }

      groups.map((gid) => {
        if (af.byGroup[gid] === undefined) {
          const g = gid === 'privateGroup'
            ? { name: 'Private' }
            : session.user.groups.find(({ id }) => id === gid);
          af.byGroup[gid] = { name: g.name, number: 0, checked: false };
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
      if (key === 'private') {
        allFilters.byPermissions.private = !allFilters.byPermissions.private;
        allFilters.byPermissions.shared = false;
      } else {
        allFilters.byPermissions.shared = !allFilters.byPermissions.shared;
        allFilters.byPermissions.private = false;
      }
      appliedFilters.byPermissions.private = allFilters.byPermissions.private;
      appliedFilters.byPermissions.shared = allFilters.byPermissions.shared;
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
              marginRight={5}
              marginBottom={5}
              onDelete={() => toggleFilters(type, arr.private ? 'private' : 'shared')}
              fontSize={12}
            />,
          );
        }
      } else {
        tileBadgeFilters.push(arr.map((key) => (
          <TileBadge
            key={key}
            icon={filterIcons[type]}
            color="blue"
            text={allFilters[type][key].name}
            marginRight={5}
            marginBottom={5}
            onDelete={() => toggleFilters(type, key)}
            fontSize={12}
          />
        )));
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

  const fetchAllAnnotations = async (callback = () => {}) => {
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
            callback();
            setListLoading(false);
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      }
    }
  };

  const byDateUpdatedAt = (a, b) => {
    if (a.updatedAt > b.updatedAt) {
      return -1;
    } if (a.updatedAt < b.updatedAt) {
      return 1;
    }
    return 0;
  };

  const deleteAnnotationFromOutline = (arr, oid) => {
    // oid stands for outline id which is the id of an annotation that uniquely identifies
    // it in an outline. so what we need to do is go through the document tree and delete
    // the annotation with the specific oid
    for (let i = 0; i < arr.length; i += 1) {
      const {
        annotationData,
        children,
      } = arr[i];
      if (annotationData) {
        if (annotationData.oid === oid) {
          arr.splice(i, 1);
          return true;
        }
      } else if (children) {
        if (deleteAnnotationFromOutline(arr[i].children, oid)) {
          return true;
        }
      }
    }

    return false;
  };

  const loadOutlines = async () => {
    setLoadingOutlines(true);
    await getAllOutlines()
      .then(async (res) => {
        setOutlines(res.outlines.sort(byDateUpdatedAt));
        setLoadingOutlines();
        setOutlineToDelete();
      })
      .catch(() => {
        setLoadingOutlines();
        setOutlineToDelete();
      });
  };

  const updateOutlines = (o) => {
    const newOutlines = outlines.map(
      // eslint-disable-next-line no-underscore-dangle
      (outline) => (outline._id === o._id ? o : outline),
    ).sort(byDateUpdatedAt);
    setOutlines(newOutlines);
  };

  const dehydrateOutlineData = (data) => {
    const d = DeepCopyObj(data);
    for (let i = 0; i < d.length; i += 1) {
      const {
        annotation,
        children,
      } = d[i];

      if (children) {
        d[i].children = dehydrateOutlineData(children);
      }
      if (annotation) {
        delete d[i].annotation;
      }
    }

    return d;
  };

  const updateOutline = ({ name, document }) => {
    setOutlineStatus('saving');
    setOpenOutline({ name, document, callback: forceUpdate });

    saveOutlineDebounced(
      openOutline.current.id,
      { name, document: document ? dehydrateOutlineData(document) : undefined },
      (outline) => {
        updateOutlines(outline);
        setOutlineStatus('saved');
      },
    );
  };

  const setCursorAfterAnnotation = (oid) => {
    const indexOfAnnotation = openOutline.current.document
      .findIndex(({ annotationData }) => annotationData && annotationData.oid === oid);

    if (indexOfAnnotation !== -1) {
      openOutline.current.document.splice(
        indexOfAnnotation + 1,
        0,
        {
          children: [{ text: '' }],
          type: DEFAULTS_PARAGRAPH.p.type,
        },
      );
      updateOutline({});
    }
  };

  const documentInitialValue = [
    {
      children: [{ text: '' }],
      type: DEFAULTS_PARAGRAPH.p.type,
    },
  ];

  const hydrateOutlineData = (data) => {
    if (!data) {
      return documentInitialValue;
    }
    const d = DeepCopyObj(data);
    for (let i = 0; i < d.length; i += 1) {
      const {
        annotationData,
        children,
      } = d[i];

      if (children) {
        d[i].children = hydrateOutlineData(children);
      }
      if (annotationData) {
        d[i].annotation = toAnnotationsTile(annotationData, {
          dbs: '',
          from: 'outline',
          onDelete: () => {
            deleteAnnotationFromOutline(openOutline.current.document, annotationData.oid);
            updateOutline({ document: openOutline.current.document });
          },
          onClick: () => setCursorAfterAnnotation(annotationData.oid),
        });
      }
    }

    return d;
  };

  const createNewOutline = async () => {
    setCreatingOutline(true);
    await createOutline({ name: newOutlineName, document: documentInitialValue })
      .then(async (newOutline) => {
        const newOutlines = DeepCopyObj(outlines)
          .concat([newOutline])
          .sort(byDateUpdatedAt);
        // saving changes to outlines
        setOutlines(newOutlines);
        // opening new outline
        setOpenOutline({
          id: newOutline._id,
          name: newOutline.name,
          document: hydrateOutlineData(newOutline.document),
          callback: forceUpdate,
        });
        // closing modal and stopping loading ui
        setCreatingOutline();
        setShowNewOutlineModal();
      })
      .catch(() => {
        setCreatingOutline();
        setShowNewOutlineModal();
      });
    setNewOutlineName('');
  };

  const deleteO = async () => {
    setDeletingOutline(true);
    await deleteOutline(outlineToDelete._id)
      .then(async () => {
        setOutlines(outlines.filter(({ _id }) => _id !== outlineToDelete._id));
        setOutlineToDelete();
        setDeletingOutline();
      })
      .catch(() => {
        setLoadingOutlines();
        setOutlineToDelete();
      });
  };

  const getDroppedAnnotationsData = () => (annotationsBeingDragged
    ? aa.filter((anno) => annotationsBeingDragged.ids.includes(anno._id))
    : undefined);

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
    loadOutlines();
  }, []);

  useEffect(() => {
    if (mode === 'as') {
      setTab('annotations');
    } else if (mode === 'is') {
      if (allAnnotations === undefined) {
        fetchAllAnnotations(() => setApplyDefaultFilters(true));
      } else {
        setApplyDefaultFilters(true);
      }
    }
  }, [mode]);

  useEffect(() => {
    if (applyDefaultFilters) {
      applyDefaultDashboardFilters();
      setApplyDefaultFilters();
    }
  }, [allFilters, applyDefaultFilters]);

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
  let showRefreshButton = true;

  if (mode === 'as') {
    if (slug === undefined) {
      showRefreshButton = false;
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
      const aids = [];
      if ((appliedFilters.byGroup.length > 0 && appliedFilters.byGroup.includes(gid))
      || appliedFilters.byGroup.length === 0) {
        const aTiles = annosIndexes.map((i) => {
          if (filteredAnnotations.includes(i)) {
            // eslint-disable-next-line no-underscore-dangle
            aids.push(aa[i]._id);
            return toAnnotationsTile(aa[i]);
          }
          return null;
        }).filter((t) => t !== null);
        if (aTiles.length > 0) {
          const g = gid === 'privateGroup'
            ? { name: 'Private' }
            : session.user.groups.find(({ id }) => id === gid);
          annotationTiles.push(
            <ISGroupHeader
              key={`${gid}-isgroupheader`}
              name={g ? g.name : ''}
              annotationIds={aids}
              active={activeISGroupHeaders.includes(gid)}
              toggle={() => toggleISGroupHeader(gid)}
              setAnnotationsBeingDragged={(ids) => {
                if (ids) {
                  setAnnotationsBeingDragged({ ids, from: 'isGroupHeader' });
                } else {
                  setAnnotationsBeingDragged();
                }
              }}
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
      style={
        annotationsTabSelected
          ? { width: 'calc(60% - 5px)', left: 0, opacity: tabSelectionLineOpacity }
          : { width: 'calc(40% + 5px)', left: 'calc(60% - 5px)', opacity: tabSelectionLineOpacity }
      }
    />
  );

  let outlineTiles = <></>;
  if (loadingOutlines) {
    outlineTiles = <ListLoadingSpinner />;
  } else if (outlines.length === 0) {
    outlineTiles = (
      <div style={{
        background: 'white', borderRadius: 5, padding: 12,
      }}
      >
        <div style={{ fontSize: 18, color: '#424242', fontWeight: 'bold' }}>Create your first outline!</div>
        <div style={{ fontSize: 14, color: '#616161' }}>
          Click the &quot;New +&quot; button above to create your first outline.
        </div>
      </div>
    );
  } else {
    outlineTiles = outlines.map(({
      _id, name, updatedAt, document,
    }) => (
      <OutlineTile
        key={_id}
        name={name}
        activityDate={updatedAt}
        onClick={() => {
          setOpenOutline({
            id: _id,
            name,
            document: hydrateOutlineData(document),
            callback: forceUpdate,
          });
        }}
        onDelete={() => {
          setOutlineToDelete({ _id, name });
        }}
      />
    ));
  }

  const slateInitialValue = [
    {
      children: [{ text: '' }],
      type: 'p',
    },
  ];

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
    outlines: openOutline.current.id ? (
      <div style={{ marginTop: -10 }}>
        <ISOutline
          key={openOutline.current.id}
          exportDocument={(e) => {
            const eventText = {
              'annotation-studio': 'Exporting composition to Annotation Studio',
            };
            // show ui popup that we are exporting the document
            setExportingDocumentModalTitle(eventText[e] || 'Exporting...');
            setShowExportingDocumentModal(true);
            if (e === 'annotation-studio') {
              exportDocumentToAnnotationStudio({
                author: (session && session.user) ? session.user.name : '',
                composition: openOutline.current,
                callback: ({ pathname }) => router.push({ pathname }),
              });
            }
          }}
          document={openOutline.current.document || slateInitialValue}
          setDocument={(document) => updateOutline({ document })}
          getDroppedAnnotationsData={getDroppedAnnotationsData}
          hydrateOutlineData={hydrateOutlineData}
          annotationsBeingDragged={annotationsBeingDragged}
          setAnnotationsBeingDragged={setAnnotationsBeingDragged}
        />
      </div>
    )
      : (
        <div className={styles.tileContainer}>
          {outlineTiles}
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
            paddingRight: mode === 'as' ? 20 : 0,
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          {tabSelectionLine}
          <div
            className={(mode === 'is' && tab === 'annotations') ? styles.selectedTab : undefined}
            style={{
              display: 'flex',
              flex: 3,
              paddingLeft: mode === 'as' ? 0 : 5,
              paddingTop: 5,
              paddingBottom: 5,
              paddingRight: 5,
              transition: 'all 0.5s',
            }}
          >
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
            {showRefreshButton && (
            <OverlayTrigger
              key="refresh-annotaitons"
              placement="bottom"
              overlay={(
                <Popover
                  id="popover-basic"
                >
                  <Popover.Content style={{ color: '#636363' }}>
                    {`Refreshed ${moment(lastUpdated).fromNow()}`}
                  </Popover.Content>
                </Popover>
            )}
            >
              <div
                className={styles.refreshButton}
                style={tab === 'outlines' ? { color: '#9e9e9e' } : {}}
                onClick={() => {
                  if (mode === 'is' && tab === 'outlines') {
                    setTab('annotations');
                  }
                  setRefresh(true);
                }}
                onKeyDown={() => {}}
                tabIndex={-1}
                role="button"
              >
                <span style={{ fontSize: 'inherit' }}>Refresh</span>
                <ArrowClockwise size={18} style={{ margin: 'auto 5px' }} />
              </div>
            </OverlayTrigger>
            )}

            {mode === 'as'
              ? (
                <PermissionsButtonGroup
                  variant={showRefreshButton ? 'primary' : 'secondary'}
                  buttons={buttons}
                />
              )
              : (
                <ISFilterButton
                  active={annotationsTabSelected}
                  total={aa.length}
                  result={filteredAnnotations.length}
                  toggleFilters={toggleFilters}
                  filters={allFilters}
                  onClick={() => {
                    if (tab === 'outlines') {
                      setTab('annotations');
                    }
                  }}
                />
              )}
          </div>
          {mode === 'is' && (
          <div
            className={tab === 'outlines' ? styles.selectedTab : undefined}
            style={{
              display: 'flex',
              flex: 2,
              borderLeft: '1px solid #DADCE1',
              paddingLeft: 8,
              paddingBottom: 5,
              paddingRight: 5,
              alignItems: 'center',
              color: !annotationsTabSelected ? '#424242' : '#ABABAB',
            }}
          >
            <span
              onClick={() => {
                if (tab === 'outlines') {
                  setOutlineStatus();
                  setOpenOutline({ id: null, document: null, callback: forceUpdate });
                } else {
                  setTab('outlines');
                }
              }}
              onKeyDown={() => {}}
              tabIndex={-1}
              role="button"
              className={styles.headerText}
              style={{ color: annotationsTabSelected ? '#ABABAB' : '#424242' }}
            >
              Compositions
            </span>
            {openOutline.current.id ? (
              <div
                style={{ display: 'flex', flex: 1, alignItems: 'center' }}
                onClick={() => {
                  if (tab === 'annotations') {
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
                  value={openOutline.current.name}
                  onChange={(e) => updateOutline({ name: e.target.value })}
                />
                <div style={{ width: 20 }}>
                  {outlineStatus === 'saved'
                && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={(
                    <Tooltip className="styled-tooltip bottom">
                      Saved!
                    </Tooltip>
                  )}
                >
                  <CheckCircleFill size={16} color="#45AC87" />
                </OverlayTrigger>
                )}
                  {outlineStatus === 'saving'
                && (
                <OverlayTrigger
                  placement="bottom"
                  overlay={(
                    <Tooltip className="styled-tooltip bottom">
                      Saving...
                    </Tooltip>
                )}
                >
                  <Spinner animation="border" variant="primary" size="sm" />
                </OverlayTrigger>
                )}
                </div>
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
        show={outlineToDelete !== undefined}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Outline</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ display: 'flex', justifyContent: deletingOutline ? 'center' : 'left' }}>
          {deletingOutline
            ? <Spinner animation="border" variant="danger" /> : (
              <div>
                {`Are you sure you want to delete "${outlineToDelete ? outlineToDelete.name : ''}"?`}
              </div>
            )}

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setOutlineToDelete();
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteO}>Delete</Button>
        </Modal.Footer>
      </Modal>
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
          {creatingOutline
            ? <ListLoadingSpinner variant="primary" marginTop={0} /> : (
              <Form>
                <Form.Group controlId="exampleForm.ControlInput1" style={{ marginBottom: 0 }}>
                  <Form.Control
                    type="text"
                    placeholder="name of outline"
                    value={newOutlineName}
                    onChange={(e) => setNewOutlineName(e.target.value)}
                  />
                </Form.Group>
              </Form>
            )}

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowNewOutlineModal();
              setNewOutlineName('');
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={createNewOutline}>Create</Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showExportingDocumentModal} onHide={() => {}}>
        <Modal.Header>
          <Modal.Title>{exportingDocumentModalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProgressBar animated now={100} />
        </Modal.Body>
      </Modal>
    </>
  );
}
