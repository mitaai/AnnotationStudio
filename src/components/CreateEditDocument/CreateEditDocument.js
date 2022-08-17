/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, {
  useState, useEffect, useMemo, useRef,
} from 'react';
import $ from 'jquery';
import {
  Button, Modal, ProgressBar, Spinner, OverlayTrigger, Tooltip, ButtonGroup,
} from 'react-bootstrap';
import {
  ChevronCompactRight, Plus, Search, X, Check, PersonFill, PeopleFill, EyeFill, PencilSquare, ChatRightTextFill,
} from 'react-bootstrap-icons';
import { createEditor } from 'slate';
import {
  Slate, withReact,
} from 'slate-react';
import {
  DEFAULTS_LIST,
  DEFAULTS_TABLE,
  deserializeHTMLToDocument,
  EditablePlugins,
  pipe,
  serializeHTMLFromNodes,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withList,
  withMarks,
  withTable,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import unfetch from 'unfetch';
import slugify from '@sindresorhus/slugify';
import cryptoRandomString from 'crypto-random-string';
import ReactS3Uploader from 'react-s3-uploader';
import Layout from '../Layout';
import UnauthorizedCard from '../UnauthorizedCard';
import LoadingSpinner from '../LoadingSpinner';
import SlateToolbar from '../SlateToolbar';
import Select from '../Select';
import Document from '../Document';
import styles from './CreateEditDocument.module.scss';
import { plugins, withDivs } from '../../utils/slateUtil';
import SelectInput from '../SelectInput';
import TileBadge from '../TileBadge';
import { getGroupsByGroupIds } from '../../utils/groupUtil';
import { DeepCopyObj } from '../../utils/docUIUtils';
import DocumentZoomSlider from '../DocumentZoomSlider';
import { updateAllAnnotationsOnDocument } from '../../utils/annotationUtil';
import { deleteCloudfrontFiles, deleteDocumentById } from '../../utils/docUtil';
import Table from '../Table';
import { escapeRegExp } from '../../utils/stringUtil';
import { useWindowSize } from '../../utils/customHooks';
import AdditionalMetadataObj from './AdditionalMetaData';

const CreateEditDocument = ({
  statefulSession,
  document,
  session,
  loading,
  mode = 'new',
  onCancel = () => {},
  onDelete = () => {},
  onSave = () => {},
}) => {
  const windowSize = useWindowSize();
  const uploaderRef = useRef({});
  const [groups, setGroups] = useState();
  const [groupData, setGroupData] = useState();
  const [errors, setErrors] = useState([]);
  const [savingDocument, setSavingDocument] = useState();
  const [deletingDocument, setDeletingDocument] = useState();

  const [changesMade, setChangesMade] = useState();
  const [initialMount, setInitialMount] = useState(true);

  const [minimize, setMinimize] = useState();
  const [showUploadModal, setShowUploadModal] = useState();
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState();

  const [loadingDocumentText, setLoadingDocumentText] = useState(true);
  const canEditDocument = mode === 'new' || (document
    && document.state === 'draft'
    && (document.uploadContentType === 'text/slate-html' || document.uploadContentType === 'text/html'));

  const [contentType, setContentType] = useState('');
  const [htmlValue, setHtmlValue] = useState();
  const [fileObj, setFileObj] = useState();
  const [documentText, setDocumentText] = useState();
  const [slateDocument, setSlateDocument] = useState();
  const [slateLoading, setSlateLoading] = useState();

  const [deleteUploadHovered, setDeleteUploadHovered] = useState();

  const [clearTitleHovered, setClearTitleHovered] = useState();

  const [progress, setProgress] = useState({});
  const [fileName, setFileName] = useState();
  const [onChangeMsg, setOnChangeMsg] = useState();

  // const [documentHeight, setDocumentHeight] = useState();

  const fileUploading = progress.started || htmlValue !== undefined;
  const fileUploaded = htmlValue !== undefined && documentText !== undefined;
  const cloudfrontUrl = process.env.NEXT_PUBLIC_SIGNING_URL.split('/url')[0];

  /*
    Properties of metadata form
  */
  const [showAdditionalMetadata, setShowAdditionalMetadata] = useState();
  const [title, setTitle] = useState(document?.title || '');
  const [resourceType, setResourceType] = useState(document?.resourceType || 'Book');
  const [status, setStatus] = useState(document?.state || 'draft');
  const documentCannotBeADraft = document?.state === 'published' || document?.state === 'archived';
  const [contributors, setContributors] = useState(document?.contributors || [{ type: 'Author', name: '' }]);
  // aditional metadata
  const [publicationTitle, setPublicationTitle] = useState('');
  const [publicationDate, setPublicationDate] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publisherLocation, setPublisherLocation] = useState('');
  const [rightsStatus, setRightsStatus] = useState('copyrighted');
  const [volume, setVolume] = useState('');
  const [edition, setEdition] = useState('');
  const [issue, setIssue] = useState('');
  const [series, setSeries] = useState('');
  const [seriesNumber, setSeriesNumber] = useState('');
  const [url, setUrl] = useState('');
  const [dateAccessed, setDateAccessed] = useState(document?.accessed ? new Date(document?.accessed) : new Date());
  const [pages, setPages] = useState('');
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [newspaperTitle, setNewspaperTitle] = useState('');
  const [magazineTitle, setMagazineTitle] = useState('');
  const [journalTitle, setJournalTitle] = useState('');
  const [bookTitle, setBookTitle] = useState('');

  // life cycle of this state
  // 2) waiting to be used
  // 1) in use
  // 0) not in use and then sent back to state = 2
  const [addingContributor, setAddingContributor] = useState(2);
  const [initalizedSharedDocuments, setInitalizedSharedDocuments] = useState();
  const [groupsShared, setGroupsShared] = useState({
    core: {},
    contributions: {},
  });
  const [orderOfGroupsShared, setOrderOfGroupsShared] = useState({ core: [], contributions: [] });
  const [searchGroupDropdownOpen, setSearchGroupDropdownOpen] = useState();
  const [groupQuery, setGroupQuery] = useState('');

  const showCoreDocumentsInput = groupsShared?.core && Object.keys(groupsShared.core).length > 0;
  const showContributionsInput = groupsShared?.contributions
    && Object.keys(groupsShared.contributions).length > 0;
  const showNoGroupsSelected = !(showCoreDocumentsInput || showContributionsInput);

  // just incase if older version of AS4 used different keys for resource type we need to map it to
  // what the resource type keys are now
  const resourceTypePermutationsObj = {
    book: 'Book',
    'book section': 'Book Section',
    'journal article': 'Journal Article',
    'magazine article': 'Magazine Article',
    'newspaper article': 'Newspaper Article',
    'web page': 'Web Page',
    other: 'Other',
  };

  const additionalMetadataObj = AdditionalMetadataObj({
    setPublicationTitle,
    publicationDate,
    setPublicationDate,
    publisher,
    setPublisher,
    publisherLocation,
    setPublisherLocation,
    rightsStatus,
    setRightsStatus,
    volume,
    setVolume,
    edition,
    setEdition,
    issue,
    setIssue,
    series,
    setSeries,
    seriesNumber,
    setSeriesNumber,
    url,
    setUrl,
    dateAccessed,
    setDateAccessed,
    pages,
    setPages,
    websiteTitle,
    setWebsiteTitle,
    newspaperTitle,
    setNewspaperTitle,
    magazineTitle,
    setMagazineTitle,
    journalTitle,
    setJournalTitle,
    bookTitle,
    setBookTitle,
  });

  const resourceTypeOptions = Object.entries(additionalMetadataObj).map(([key, obj]) => ({ key, text: obj.text }));

  const rt = additionalMetadataObj[resourceType] ? resourceType : resourceTypePermutationsObj[resourceType];
  const { additionalMetadataHeight } = additionalMetadataObj[rt];


  const updateContributors = (index, { name, type }) => {
    const newContributors = contributors.slice();
    if (name) {
      newContributors[index].name = name;
    }

    if (type) {
      newContributors[index].type = type;
    }
    setContributors(newContributors);
  };

  const addContributor = () => {
    setContributors([{ type: 'Author', name: '' }].concat(contributors.slice()));
    setAddingContributor(0);
  };

  const removeContributor = (index) => {
    if (contributors.length === 1 && index === 0) {
      setContributors([]);
      setAddingContributor(1);
    }
    const newContributors = contributors.slice();
    newContributors.splice(index, 1);
    setContributors(newContributors);
  };

  const addGroups = (grps) => {
    const gs = DeepCopyObj(grps);
    const newGroupsShared = DeepCopyObj(groupsShared);
    const newOrderOfGroupsShared = DeepCopyObj(orderOfGroupsShared);

    gs.map((g) => {
      const ids = g.members.filter(({ role }) => role === 'owner' || role === 'manager').map((m) => m.id);
      if (ids.includes(session.user.id)) {
        newGroupsShared.core[g._id] = g;
        newOrderOfGroupsShared.core.push(g._id);
      } else {
        newGroupsShared.contributions[g._id] = g;
        newOrderOfGroupsShared.contributions.push(g._id);
      }

      return null;
    });
    setGroupsShared(newGroupsShared);
    setOrderOfGroupsShared(newOrderOfGroupsShared);
  };

  const deleteGroup = (gid) => {
    const newGroupsShared = DeepCopyObj(groupsShared);
    const newOrderOfGroupsShared = DeepCopyObj(orderOfGroupsShared);
    if (newGroupsShared.core[gid]) {
      delete newGroupsShared.core[gid];
      const i = newOrderOfGroupsShared.core.findIndex((id) => id === gid);
      if (i !== -1) {
        newOrderOfGroupsShared.core.splice(i, 1);
      }
    } else if (newGroupsShared.contributions[gid]) {
      delete newGroupsShared.contributions[gid];
      const i = newOrderOfGroupsShared.contributions.findIndex((id) => id === gid);
      if (i !== -1) {
        newOrderOfGroupsShared.contributions.splice(i, 1);
      }
    }

    setOrderOfGroupsShared(newOrderOfGroupsShared);
    setGroupsShared(newGroupsShared);
  };

  const createDocument = async () => {
    const slug = `${slugify(title)}-${cryptoRandomString({ length: 5, type: 'hex' })}`;
    const postUrl = '/api/document';
    const newDocument = {
      uploadContentType: htmlValue ? contentType : 'text/slate-html',
      fileObj,
      title: title === '' ? (fileName || 'Untitled') : title,
      groups: orderOfGroupsShared.core.concat(orderOfGroupsShared.contributions),
      slug,
      resourceType,
      contributors,
      publisher,
      publicationDate,
      publicationTitle,
      websiteTitle,
      newspaperTitle,
      magazineTitle,
      journalTitle,
      bookTitle,
      edition,
      issue,
      url,
      accessed: dateAccessed,
      rightsStatus,
      location: publisherLocation,
      state: status || 'draft',
      text: htmlValue || serializeHTMLFromNodes({ plugins, nodes: slateDocument }),
      volume,
      pageNumbers: undefined,
      publication: undefined,
      series,
      seriesNumber,
      notes: undefined,
      textAnalysisId: undefined,
    };

    const res = await unfetch(postUrl, {
      method: 'POST',
      body: JSON.stringify(newDocument),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      return Promise.resolve(result);
    } if (res.status === 413) {
      return Promise.reject(Error(
        'Sorry, this file is too large to use on Annotation Studio. '
        + 'You may try breaking it up into smaller parts.',
      ));
    }
    return Promise.reject(Error(`Unable to create document: error ${res.status} received from server`));
  };

  const editDocument = async () => {
    const patchUrl = `/api/document/${document.id}`;
    const newDocument = {
      title: title === '' ? 'Untitled' : title,
      groups: orderOfGroupsShared.core.concat(orderOfGroupsShared.contributions),
      slug: document.slug,
      resourceType,
      contributors,
      publisher,
      publicationTitle,
      publicationDate,
      edition,
      url,
      websiteTitle,
      newspaperTitle,
      magazineTitle,
      journalTitle,
      bookTitle,
      accessed: dateAccessed,
      rightsStatus,
      location: publisherLocation,
      state: status || 'draft',
      text: canEditDocument
        ? serializeHTMLFromNodes({ plugins, nodes: slateDocument })
        : undefined,
      volume,
      issue: undefined,
      pageNumbers: pages,
      publication: undefined,
      series,
      seriesNumber,
      notes: undefined,
      textAnalysisId: undefined,
    };

    const res = await unfetch(patchUrl, {
      method: 'PATCH',
      body: JSON.stringify(newDocument),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      if (newDocument.state === 'draft') {
        return Promise.resolve(result);
      } return Promise.resolve(await updateAllAnnotationsOnDocument(newDocument));
    }
    return Promise.reject(Error(`Unable to edit document: error ${res.status} received from server`));
  };

  const [documentZoom, setDocumentZoom] = useState(100);

  const scale = documentZoom / 100;
  const documentWidth = 750;
  const slateDocPos = `calc(50% - ${documentWidth / 2}px)`;
  const slateLoadingPos = `calc(50% - ${(documentWidth / 2) - 20}px)`;
  const toolbarHeight = 49;

  const extraWidth = 0;
  const documentIsPDF = (
    document && document.uploadContentType && document.uploadContentType.includes('pdf')
  ) || (htmlValue && contentType);


  const withPlugins = [
    withReact,
    withHistory,
    withImageUpload(),
    withCodeBlock(),
    withInlineVoid({ plugins }),
    withList(DEFAULTS_LIST),
    withMarks(),
    withTable(DEFAULTS_TABLE),
    withDeserializeHTML({ plugins }),
    withDivs(),
  ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

  const deleteUploadedDocument = (deleteFiles) => {
    if (deleteFiles && fileObj) {
      deleteCloudfrontFiles({
        noOwner: true,
        fileObj,
      });
    }
    setContentType('');
    setHtmlValue();
    setDocumentText();
    setProgress({});
    setFileName();
    setFileObj();
    setDeleteUploadHovered();
    setDocumentZoom(100);
  };

  const numRetries = 60;
  const origPercent = 25;

  const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchRetry = async (fileUrl, options = {}, retries = numRetries, backoff = 2400) => {
    const retryCodes = [403, 408, 500, 502, 503, 504, 522, 524];
    return unfetch(fileUrl, options)
      .then(async (res) => {
        if (res.ok) {
          setProgress({
            started: true,
            percent: 100,
            status: 'Complete',
          });
          const text = await res.text();
          return text;
        } if (retries > 0 && retryCodes.includes(res.status)) {
          setProgress(
            {
              started: true,
              percent: origPercent + (
                ((numRetries - retries) / numRetries) * (100 - origPercent)
              ),
              status: 'Waiting',
            },
          );
          await timeout(backoff);
          return fetchRetry(fileUrl, options, retries - 1, backoff);
        }
        setProgress(
          {
            started: false,
            percent: 100,
            status: 'Failed',
          },
        );
        throw new Error('Failed');
      })
      .then((text) => text)
      .catch((err) => setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]));
  };

  const getProcessedDocument = async (fileUrl) => fetchRetry(fileUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  });


  const transition = 'all 0.5s';
  const border = '1px solid #dddddd';
  const metadataContainerWidth = windowSize.isMobilePhone ? windowSize.width - 20 : 500;
  const states = {
    default: {
      desktopView: {
        leftPanel: {
          left: 0,
          width: `calc(100vw - ${metadataContainerWidth}px)`,
        },
        rightPanel: {
          left: `calc(100vw - ${metadataContainerWidth}px)`,
          width: metadataContainerWidth,
        },
        chevron: {
          left: `calc(100vw - ${metadataContainerWidth}px - 20px)`,
          transform: 'rotate(-45deg)',
        },
        chevronSpan: {
          top: 3,
          left: 6,
          transform: 'rotate(45deg)',
        },
      },
      mobileView: {
        leftPanel: {
          left: 0,
          width: 'calc(100vw - 20px)',
        },
        rightPanel: {
          left: `calc(100vw - ${metadataContainerWidth}px)`,
          width: metadataContainerWidth,
        },
        chevron: {
          left: `calc(100vw - ${metadataContainerWidth}px - 20px)`,
          transform: `rotate(${windowSize.isMobilePhone ? 135 : -45}deg)`,
          backgroundColor: windowSize.isMobilePhone ? 'white' : undefined,
        },
        chevronSpan: {
          top: windowSize.isMobilePhone ? 5 : 3,
          left: 6,
          transform: `rotate(${windowSize.isMobilePhone ? -135 : 45}deg)`,
        },
      },
    },
    minimize: {
      desktopView: {
        leftPanel: {
          left: 0,
          width: 'calc(100vw - 20px)',
        },
        rightPanel: {
          left: 'calc(100vw - 20px)',
          width: metadataContainerWidth,
        },
        chevron: {
          left: 'calc(100vw - 20px - 20px)',
          transform: 'rotate(-45deg)',
        },
        chevronSpan: {
          top: 5,
          left: 4,
          transform: 'rotate(-135deg)',
        },
      },
      mobileView: {
        leftPanel: {
          left: 0,
          width: 'calc(100vw - 20px)',
        },
        rightPanel: {
          left: 'calc(100vw - 20px)',
          width: metadataContainerWidth,
        },
        chevron: {
          left: 'calc(100vw - 20px - 20px)',
          transform: 'rotate(-45deg)',
        },
        chevronSpan: {
          top: 5,
          left: 4,
          transform: 'rotate(-135deg)',
        },
      },
    },
  };

  const state = states[minimize ? 'minimize' : 'default'][windowSize.smallerThanOrEqual.isTabletOrMobile ? 'mobileView' : 'desktopView'];

  const rowHeader = (icon, text) => (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'left' }}>
      {icon}
      <span style={{ marginLeft: 4 }}>{text}</span>
    </span>
  );

  const x = {
    content: <X size={20} />,
    style: {
      color: '#E20101', padding: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #EBEFF3',
    },
  };

  const check = {
    content: <Check size={20} />,
    style: {
      color: '#10A268', padding: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #EBEFF3',
    },
  };

  const checkAsterisk = {
    content: [<Check size={20} />, <span style={{ color: '#757575' }}>*</span>],
    style: {
      color: '#10A268', padding: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #EBEFF3',
    },
  };

  const rowHeaderStyle = {
    padding: 15, backgroundColor: '#f6f6f6', borderRight: '1px solid #EBEFF3', textAlign: 'center', fontWeight: 500,
  };

  const statesOfStatusTableRows = {
    draft: [
      {
        columns: [
          {
            content: rowHeader(<PersonFill size={16} color="#424242" />, 'Me'),
            style: rowHeaderStyle,
          },
          x,
          checkAsterisk,
          check,
        ],
      },
      {
        columns: [
          {
            content: rowHeader(<PeopleFill size={16} color="#424242" />, 'Group'),
            style: rowHeaderStyle,
          },
          x,
          x,
          x,
        ],
      },
      /*
      {
        columns: [
          {
            content: rowHeader(<Globe size={16} color="#424242" />, 'Public'),
            style: rowHeaderStyle,
          },
          x,
          x,
          x,
        ],
      },
      */
    ],
    published: [
      {
        columns: [
          {
            content: rowHeader(<PersonFill size={16} color="#424242" />, 'Me'),
            style: rowHeaderStyle,
          },
          check,
          x,
          check,
        ],
      },
      {
        columns: [
          {
            content: rowHeader(<PeopleFill size={16} color="#424242" />, 'Group'),
            style: rowHeaderStyle,
          },
          check,
          x,
          check,
        ],
      },
      /*
      {
        columns: [
          {
            content: rowHeader(<Globe size={16} color="#424242" />, 'Public'),
            style: rowHeaderStyle,
          },
          x,
          x,
          x,
        ],
      },
      */
    ],
    archived: [
      {
        columns: [
          {
            content: rowHeader(<PersonFill size={16} color="#424242" />, 'Me'),
            style: rowHeaderStyle,
          },
          check,
          x,
          x,
        ],
      },
      {
        columns: [
          {
            content: rowHeader(<PeopleFill size={16} color="#424242" />, 'Group'),
            style: rowHeaderStyle,
          },
          check,
          x,
          x,
        ],
      },
      /*
      {
        columns: [
          {
            content: rowHeader(<Globe size={16} color="#424242" />, 'Public'),
            style: rowHeaderStyle,
          },
          x,
          x,
          x,
        ],
      },
      */
    ],
  };

  const statusTableRows = statesOfStatusTableRows[status];
  const minimizeOffset = mode === 'edit' ? 215 : 233;

  const buttonOffsetXStates = {
    desktop: minimize ? minimizeOffset : metadataContainerWidth,
    mobile: minimizeOffset - 71,
  };

  const buttonOffsetXState = buttonOffsetXStates[windowSize.smallerThanOrEqual.isTabletOrMobile ? 'mobile' : 'desktop'];

  const secondNavbarExtraContent = (
    <div style={{
      position: 'absolute', top: windowSize.isMobilePhone ? 4 : -8, left: windowSize.isMobilePhone ? -40 : -33, height: 64,
    }}
    >
      <div style={{
        position: 'absolute', transition, left: `calc(100vw - ${buttonOffsetXState}px)`, height: '100%', display: 'flex', flexDirection: 'row',
      }}
      >
        <Button
          className={styles.cancelChangesBtn}
          style={{
            transition,
            left: -92 + (minimize || windowSize.smallerThanOrEqual.isTabletOrMobile ? 5 : 0),
          }}
          onClick={mode === 'new' ? () => setShowDeleteDocumentModal(true) : onCancel}
        >
          Cancel
        </Button>
        <div style={{
          transition,
          height: 44,
          width: 1,
          backgroundColor: '#dddddd',
          margin: `auto ${minimize || windowSize.smallerThanOrEqual.isTabletOrMobile ? 0 : 12}px auto 0px`,
          opacity: minimize || windowSize.smallerThanOrEqual.isTabletOrMobile ? 0 : 1,
        }}
        />

        {mode === 'new'
          ? (
            <Button
              className={styles.createNewDocumentBtn}
              onClick={() => {
                setSavingDocument(true);
                createDocument()
                  .then((res) => {
                    onSave({ slug: res.ops[0].slug });
                  })
                  .catch((err) => {
                    setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                    setSavingDocument();
                  });
              }}
            >
              Create Document
            </Button>
          )
          : (
            <Button
              className={styles.saveChangesBtn}
              onClick={() => {
                setSavingDocument(true);
                editDocument()
                  .then(() => {
                    onSave();
                  })
                  .catch((err) => {
                    setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                    setSavingDocument();
                  });
              }}
              disabled={!changesMade}
            >
              Save Changes
            </Button>
          )}
      </div>
    </div>
  );

  const slateInitialValue = [
    {
      children: [{ text: '' }],
      type: 'p',
    },
  ];

  const spacer = (
    <div
      style={{
        width: 100, height: 6, borderRadius: 3, backgroundColor: '#eeeeee', margin: '0px auto', color: 'transparent',
      }}
    >
      .
    </div>
  );

  const queriedGroups = (groupData || []).filter(({ name }) => {
    // eslint-disable-next-line no-useless-escape
    const r = groupQuery ? new RegExp(`\.\*${escapeRegExp(groupQuery)}\.\*`, 'i') : new RegExp('\.\*', 'i');
    return name.search(r) !== -1;
  });// .sort();

  const searchDropdown = (
    <div
      key="search-dropdown-div"
      style={{
        height: 0,
        position: 'relative',
        visibility: searchGroupDropdownOpen ? 'visible' : 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', zIndex: 2, backgroundColor: '#f9f9f9', width: '100%', height: 110, padding: '6px 0px', border: '1px solid #bdbdbd', borderRadius: 8, dipslay: 'flex', flexDirection: 'column', overflowY: 'overlay',
      }}
      >
        {queriedGroups.map((g) => {
          const selectedAlready = groupsShared.core[g._id] || groupsShared.contributions[g._id];
          return (
            <div
              key={`search-group-row-${g._id}`}
              className={styles.searchGroupRow}
              onClick={() => {
                if (!selectedAlready) {
                  addGroups([g]);
                  setSearchGroupDropdownOpen();
                }
              }}
            >
              <span style={{ flex: 1 }}>{g.name}</span>
              {selectedAlready && <Check size={18} color="#355CBC" />}
            </div>
          );
        })}
      </div>
    </div>

  );

  useEffect(() => {
    if (initialMount) {
      setInitialMount();
    } else if (!changesMade) {
      setChangesMade(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    slateDocument, title, resourceType, status, contributors, publicationDate, publisher,
    publisherLocation, rightsStatus, volume, edition, series, seriesNumber, url,
    dateAccessed,
  ]);

  useEffect(() => {
    if (addingContributor === 1) {
      setTimeout((func) => func(), 500, addContributor);
    } else if (addingContributor === 0) {
      setAddingContributor(2);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addingContributor]);


  useEffect(() => {
    if (!groups) { return; }

    const groupIds = groups.map(({ id }) => id);
    getGroupsByGroupIds(groupIds)
      .then((res) => {
        setGroupData(res);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  useEffect(() => {
    if (session !== undefined) {
      setGroups(session.user.groups);
    }
  }, [session]);

  useEffect(() => {
    if (!document) { return; }
    // loading document text
    if (document.text
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
          // replacing the cloudfront url with the actual text result from the url
          setDocumentText(result);
          setLoadingDocumentText();
        });
      }).catch(() => {
        setLoadingDocumentText();
      });
    } else {
      setDocumentText(document.text);
      setLoadingDocumentText();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document]);

  useEffect(() => {
    if (document && groupData && !initalizedSharedDocuments) {
      const documentGroupData = groupData.filter(({ _id }) => document.groups.includes(_id));
      addGroups(documentGroupData);
      setInitalizedSharedDocuments(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupData, document]);

  useEffect(() => {
    if (documentText && !loadingDocumentText) {
      // eslint-disable-next-line no-undef
      const txtHtml = (mode === 'edit' && document) ? new DOMParser().parseFromString(documentText, 'text/html') : undefined;
      if (txtHtml) {
        const initSlateValue = (mode === 'edit' && document && (!document.uploadContentType
          || (!document.uploadContentType.includes('pdf') && !document.uploadContentType.includes('epub') && !document.uploadContentType.includes('application'))))
          ? deserializeHTMLToDocument({ plugins, element: txtHtml.body })
          : slateInitialValue;
        setSlateDocument(initSlateValue);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentText, loadingDocumentText]);

  useEffect(() => {
    // another thing we must do is set all the links in the document to target="_blank" so that
    // if the user clicks on a link it will open the url in another tab and presever the work
    // they are doing on the document view page
    if (!loadingDocumentText) {
      $('#document-container a').attr('target', '_blank');
    }
  }, [loadingDocumentText]);

  useEffect(() => {
    if (progress.started && showUploadModal) {
      setShowUploadModal();
      setOnChangeMsg();
    }
    if (progress.status === 'Failed') {
      setTimeout((func) => {
        func();
      }, 1000, deleteUploadedDocument);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  useEffect(() => {
    if (fileName && (title === undefined || title.length === 0)) {
      setTitle(fileName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName]);

  useEffect(() => {
    if (!showUploadModal && onChangeMsg) {
      setOnChangeMsg();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUploadModal]);

  /*
  useEffect(() => {
    if (documentText) {
      setDocumentHeight($('#document-container-col').height());
    } else {
      setDocumentHeight();
    }
  }, [documentText]);
  */

  const statusSelected = {
    draft: status === 'draft',
    published: status === 'published',
    archived: status === 'archived',
  };

  const draftBtn = (
    <Button
      className={[
        statusSelected.draft ? styles.statusButtonGroupActive : styles.statusButtonGroup,
        documentCannotBeADraft ? styles.disabled : '',
      ].join(' ')}
      variant={`${statusSelected.draft ? 'outline-' : 'outline-'}primary`}
      onClick={documentCannotBeADraft ? () => {} : () => setStatus('draft')}
    >
      Draft
    </Button>
  );

  const draftBtnGroup = documentCannotBeADraft ? (
    <OverlayTrigger
      key="overlay-trigger-draft-btn"
      placement="top"
      overlay={(
        <Tooltip className="styled-tooltip top">
          This document has already been published or archived
        </Tooltip>
      )}
    >
      {draftBtn}
    </OverlayTrigger>
  ) : draftBtn;

  return (
    <>
      <Layout
        alerts={errors}
        type={`create-new-document${minimize ? '-minimize' : ''}`}
        breadcrumbs={[
          { name: 'Documents', href: '/documents' },
          { name: document?.title || 'Create a new document' },
        ]}
        title="New Document"
        statefulSession={statefulSession}
        secondNavbarExtraContent={windowSize.greaterThan.isMobilePhone && secondNavbarExtraContent}
        noContainer
      >
        {!session && loading && (
          <LoadingSpinner />
        )}
        {!session && !loading && (
        <UnauthorizedCard />
        )}
        {session && !loading && (
        <>
          <div style={{
            display: 'flex', flexDirection: 'row', position: 'relative', height: '100%', borderTop: border,
          }}
          >
            <div style={{
              position: 'absolute', height: '100%', transition, ...state.leftPanel,
            }}
            >
              {!canEditDocument || fileUploading || fileUploaded ? (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      className={(deleteUploadHovered && fileUploaded && styles.deleteUploadHovered) || (fileUploading && !fileUploaded ? styles.gradient : '')}
                      style={{
                        transition,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: toolbarHeight,
                        backgroundColor: '#F0F0F0',
                        borderBottom: '1px solid #ced4da',
                        paddingLeft: mode === 'edit' && windowSize.smallerThanOrEqual.isTabletOrMobile ? 30 : 47,
                        paddingRight: 13,
                      }}
                    >
                      {mode === 'new' && (
                      <div
                        className={styles.cancelUploadBtn}
                        style={{ opacity: fileUploaded ? 1 : 0, transition }}
                        onClick={fileUploaded ? () => deleteUploadedDocument(true) : () => {}}
                        onMouseEnter={fileUploaded ? () => setDeleteUploadHovered(true) : () => {}}
                        onMouseLeave={fileUploaded ? () => setDeleteUploadHovered() : () => {}}
                      >
                        <X size={20} />
                        <span className={styles.deleteFileText}>
                          <span style={{
                            position: 'relative',
                            left: 3,
                            color: 'white',
                            width: 75,
                            textOverflow: 'clip',
                            whiteSpace: 'nowrap',
                          }}
                          >
                            Delete File
                          </span>
                        </span>
                      </div>
                      )}
                      {(fileUploading || fileUploaded)
                        && (
                        <span style={{
                          transition, color: deleteUploadHovered && fileUploaded ? '#E20101' : '#616161', fontWeight: 500, marginLeft: 8, position: 'relative', left: fileUploaded ? 0 : -15,
                        }}
                        >
                          {fileName || (fileUploaded ? 'File Uploaded' : 'Uploading document...')}
                        </span>
                        )}
                      {mode === 'edit' && document && (
                      <div style={{
                        position: 'relative', fontWeight: 500, marginLeft: 2, fontSize: 16, color: '#525252',
                      }}
                      >
                        Edit Document
                      </div>
                      )}
                      {(fileUploaded || document) && (
                      <div style={{
                        position: 'absolute', right: !minimize || windowSize.smallerThanOrEqual.isTabletOrMobile ? 13 : 49, top: 8.5, transition,
                      }}
                      >
                        <DocumentZoomSlider
                          stateful
                          documentZoom={documentZoom}
                          setDocumentZoom={setDocumentZoom}
                          style={{ backgroundColor: '#f8f8f8', border: '1px solid #CDCEDA' }}
                          min={100}
                        />
                      </div>
                      )}
                    </div>
                  </div>
                  <div
                    id="document-container"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: toolbarHeight,
                      height: `calc(100% - ${toolbarHeight}px)`,
                      width: state.leftPanel.width,
                      padding: 20,
                      color: fileUploading && !fileUploaded ? 'transparent' : undefined,
                      transition,
                    }}
                  >
                    {fileUploading && !fileUploaded && progress.percent
                      && (
                      <ProgressBar
                        className={styles.progressBar}
                        style={{
                          width: documentWidth - 100,
                          position: 'absolute',
                          top: 'max(25%, 100px)',
                          left: `calc(50% - ${(documentWidth - 100) / 2}px`,
                        }}
                        variant={progress.status === 'Failed' ? 'danger' : 'primary'}
                        now={progress.percent.toFixed(0)}
                        label={progress.status === 'Failed' ? 'Failed' : `${progress.percent.toFixed(0)}%`}
                      />
                      )}
                    <div
                      id="document-container-col"
                      style={{
                        transform: `scale(${scale}) translateY(0px)`,
                        transformOrigin: 'top center',
                        minWidth: documentWidth,
                        maxWidth: documentWidth,
                        // height: documentHeight === undefined ? undefined : documentHeight,
                        position: 'relative',
                        left: 'calc(50% - 375px)',
                        marginTop: 10,
                        marginBottom: 30,
                        transition: 'opacity 0.75s, filter 1s',
                        opacity: documentText ? 1 : 0,
                        filter: `blur(${documentText ? 0 : 6}px)`,
                      }}
                    >
                      <Document
                        setShowUnsavedChangesToast={() => {}}
                        setShowMaxTextLengthReached={() => {}}
                        annotationIdBeingEdited={undefined}
                        addActiveAnnotation={() => {}}
                        removeActiveAnnotation={() => {}}
                        displayAnnotationsInChannels={false}
                        setChannelAnnotations={() => {}}
                        annotations={[]}
                        documentHighlightedAndLoaded
                        addAnnotationToChannels={() => {}}
                        annotateDocument={undefined}
                        documentToAnnotate={{ ...document, text: documentText || document?.text }}
                        documentZoom={documentZoom}
                        alerts={[]}
                        setAlerts={setErrors}
                        user={session ? session.user : undefined}
                        showCannotAnnotateDocumentToast={false}
                        setShowCannotAnnotateDocumentToast={() => {}}
                        loadingDocument={loadingDocumentText}
                      />
                    </div>
                    <div style={{ width: '100%', height: 0 }} />
                  </div>
                </>
              ) : (
                <Slate
                  editor={editor}
                  value={slateDocument || slateInitialValue}
                  disabled={false}
                  onChange={(value) => {
                    setSlateLoading(false);
                    setSlateDocument(value);
                  }}
                >
                  <SlateToolbar
                    id="hello"
                    key="goodbye"
                    disabled={false}
                    style={{ borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}
                  />
                  <div style={{ position: 'absolute', width: '100%' }}>
                    <OverlayTrigger
                      placement="bottom"
                      overlay={(
                        <Tooltip className="styled-tooltip bottom">
                          PDF, DOCX, ODT, EPUB
                        </Tooltip>
                  )}
                    >
                      <Button
                        className={styles.uploadDocumentBtn}
                        style={{
                          transition,
                          top: -41.5,
                          left: windowSize.smallerThanOrEqual.isTabletOrMobile ? 27 : 50,
                        }}
                        onClick={() => setShowUploadModal(true)}
                        disabled={progress.started}
                      >
                        Upload File
                      </Button>
                    </OverlayTrigger>
                  </div>

                  {slateLoading && (
                  <div
                    style={{
                      position: 'absolute', zIndex: 5, left: slateLoadingPos, top: toolbarHeight + 30,
                    }}
                    className={styles['slate-loader']}
                  >
                    <Spinner animation="border" role="status">
                      <span className="sr-only">Loading...</span>
                    </Spinner>
                    <div className="text-center">
                      <h4 className="text-muted">
                        <em>Please wait, processing pasted content.</em>
                      </h4>
                      <small className="text-muted">
                        The page may become unresponsive. Please do not
                        close or navigate away from the page.
                      </small>
                    </div>
                  </div>
                  )}
                  <div id="outline-container-container">
                    <EditablePlugins
                      readOnly={false}
                      plugins={plugins}
                      disabled={false}
                      onKeyDown={[(e) => {
                        const isPasteCapture = (e.ctrlKey || e.metaKey)
            && e.keyCode === 86;
                        if (isPasteCapture) {
                          setSlateLoading(true);
                        }
                      }]}
                      placeholder="Or paste/type text here"
                      id="outline-container"
                      className={styles['slate-editor']}
                    />
                  </div>

                </Slate>
              )}
            </div>
            <div
              style={{
                transition,
                position: 'absolute',
                left: windowSize.isMobilePhone && !minimize ? 0 : -20,
                opacity: windowSize.isMobilePhone && !minimize ? 1 : 0,
                backgroundColor: 'white',
                width: 20,
                height: '100%',
              }}
            />
            <div
              className={styles.chevronContainer}
              style={{
                transition,
                borderLeft: border,
                borderTop: border,
                ...state.chevron,
              }}
              onClick={() => setMinimize(!minimize)}
            >
              <span style={{
                position: 'absolute', ...state.chevronSpan,
              }}
              >
                <ChevronCompactRight size={20} />
              </span>
            </div>
            <div
              className={styles.metadataContainer}
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                height: '100%',
                backgroundColor: '#F9F9F9',
                borderLeft: border,
                padding: '20px 24px',
                overflowY: 'overlay',
                overflowX: 'hidden',
                transition,
                ...state.rightPanel,
              }}
            >
              {windowSize.isMobilePhone && secondNavbarExtraContent}
              <div style={{
                fontSize: 22, fontWeight: 'bold', color: '#424242', marginBottom: 20,
              }}
              >
                Metadata
              </div>
              <div style={{
                fontSize: 16, color: '#424242', fontWeight: 'bold', marginBottom: 10,
              }}
              >
                Title
              </div>
              <div className={[
                styles.titleInputContainer,
                clearTitleHovered ? styles.clearTitleHovered : '',
              ].join(' ')}
              >
                <input
                  placeholder={fileName || 'Untitled'}
                  style={{
                    flex: 1,
                  }}
                  type="text"
                  value={title}
                  maxLength={100}
                  onChange={(ev) => setTitle(ev.target.value)}
                />
                <div
                  className={styles.clearTitleIcon}
                  onClick={() => setTitle('')}
                  onMouseEnter={() => setClearTitleHovered(true)}
                  onMouseLeave={() => setClearTitleHovered()}
                >
                  <X size={18} />
                </div>
              </div>
              <div style={{
                fontSize: 16, color: '#424242', fontWeight: 'bold', marginBottom: 10,
              }}
              >
                Type of Resource
              </div>
              <div style={{ marginBottom: 20 }}>
                <Select
                  options={resourceTypeOptions}
                  selectedOptionKey={resourceType}
                  setSelectedOptionKey={setResourceType}
                />
              </div>
              <div style={{
                display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10,
              }}
              >
                <span style={{
                  fontSize: 16, color: '#424242', fontWeight: 'bold', flex: 1,
                }}
                >
                  Contributor(s)
                </span>
                <span
                  className={styles.hoverableText}
                  style={{ fontSize: 13 }}
                  onClick={() => setAddingContributor(1)}
                >
                  + Add a contributor
                </span>
              </div>
              <div
                style={{
                  overflow: addingContributor === 2 ? 'hidden' : undefined,
                  transition: addingContributor > 0 ? 'all 0.5s' : 'none',
                  height: addingContributor === 1 ? 42 : 0,
                  opacity: addingContributor === 1 ? 1 : 0,
                }}
              >
                <SelectInput
                  style={{ marginBottom: 4 }}
                  options={[
                    { text: 'Author', key: 'Author' },
                    { text: 'Editor', key: 'Editor' },
                    { text: 'Translator', key: 'Translator' },
                    { text: 'Contributor', key: 'Contributor' },
                  ]}
                  selectedOptionKey="Author"
                  setSelectedOptionKey={() => {}}
                  value=""
                  setValue={() => {}}
                  onDelete={() => {}}
                />
              </div>
              {contributors.map(({ type, name }, i) => (
                <SelectInput
                  key={`selet-input-contribution-${i}`}
                  style={{ marginBottom: 4 }}
                  options={[
                    { text: 'Author', key: 'Author' },
                    { text: 'Editor', key: 'Editor' },
                    { text: 'Translator', key: 'Translator' },
                    { text: 'Contributor', key: 'Contributor' },
                  ]}
                  selectedOptionKey={type}
                  setSelectedOptionKey={(k) => updateContributors(i, { type: k })}
                  value={name}
                  setValue={(v) => updateContributors(i, { name: v })}
                  onDelete={() => removeContributor(i)}
                />
              ))}
              <div
                className={styles.additionalMetadata}
                style={{
                  minHeight: showAdditionalMetadata ? additionalMetadataHeight : 0,
                  opacity: showAdditionalMetadata ? 1 : 0,
                }}
              >
                {additionalMetadataObj[resourceType]?.html}
              </div>
              <div
                className={styles.hoverableText}
                style={{
                  fontSize: 14, marginBottom: 30, textAlign: 'center',
                }}
                onClick={() => setShowAdditionalMetadata(!showAdditionalMetadata)}
              >
                {showAdditionalMetadata ? '- Hide additional metadata' : '+ Show additional metadata'}
              </div>
              {spacer}
              <div style={{
                fontSize: 22, fontWeight: 'bold', color: '#424242', marginTop: 30, marginBottom: 20,
              }}
              >
                Share
              </div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  flex: 1,
                  height: 38,
                  alignItems: 'center',
                  borderRadius: 8,
                  border: '1px solid #bdbdbd',
                  backgroundColor: '#fcfcfc', // searchDisabled ? '#eeeeee' :
                  marginBottom: 5,
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
                      fontStyle: groupQuery.length > 0 ? 'normal' : 'italic',
                    }}
                    placeholder="Search group names"
                    onChange={(ev) => setGroupQuery(ev.target.value)}
                    onFocus={() => setSearchGroupDropdownOpen(true)}
                    value={groupQuery}
                  />
                  <div style={{
                    height: 36, width: 36, borderRadius: '0px 8px 8px 0px', backgroundColor: '#eeeeee', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                  }}
                  >
                    <Plus size={20} color="#424242" style={{ transform: 'rotate(45deg)' }} />
                  </div>
                </div>
              </div>
              {searchDropdown}
              <div style={{ marginBottom: 40, position: 'relative' }}>
                {showNoGroupsSelected && (
                <div style={{
                  padding: '30px 0px',
                  textAlign: 'center',
                  backgroundColor: '#F6F6F6',
                  border: '1px solid #E8E8EA',
                  borderRadius: 4,
                  color: '#9e9e9e',
                  fontSize: 14,
                }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>No Groups Selected</div>
                  <div style={{ fontSize: 13 }}>Search for groups to share document</div>
                </div>
                )}
                {showCoreDocumentsInput && (
                <div
                  className={styles.groupShareContainer}
                >
                  <div style={{
                    fontSize: 14, fontWeight: 'bold', color: '#616161', position: 'absolute', top: -8, backgroundColor: '#f9f9f9', padding: '0px 5px', lineHeight: '14px',
                  }}
                  >
                    Shared as an Owner/Manager Core Document
                  </div>
                  {orderOfGroupsShared.core.map(
                    (gid) => (
                      <TileBadge
                        key={gid}
                        text={groupsShared.core[gid]?.name}
                        fontSize={14}
                        color="blue"
                        onDelete={() => deleteGroup(gid)}
                        marginRight={6}
                      />
                    ),
                  )}
                </div>
                )}

                {showContributionsInput && (
                <div
                  className={styles.groupShareContainer}
                >
                  <div style={{
                    fontSize: 14, fontWeight: 'bold', color: '#616161', position: 'absolute', top: -8, backgroundColor: '#f9f9f9', padding: '0px 5px', lineHeight: '14px',
                  }}
                  >
                    Shared as a Contribution
                  </div>
                  {orderOfGroupsShared.contributions.map(
                    (gid) => (
                      <TileBadge
                        key={gid}
                        text={groupsShared.contributions[gid]?.name}
                        fontSize={14}
                        color="blue"
                        onDelete={() => deleteGroup(gid)}
                        marginRight={6}
                      />
                    ),
                  )}
                </div>
                )}
              </div>
              {spacer}
              <div style={{
                fontSize: 22, fontWeight: 'bold', color: '#424242', marginTop: 30, marginBottom: 20,
              }}
              >
                Status
              </div>
              <ButtonGroup aria-label="Basic example">
                {draftBtnGroup}
                <Button
                  className={statusSelected.published ? styles.statusButtonGroupActive : styles.statusButtonGroup}
                  variant={`${statusSelected.published ? 'outline-' : 'outline-'}primary`}
                  onClick={() => setStatus('published')}
                >
                  Published
                </Button>
                <Button
                  className={statusSelected.archived ? styles.statusButtonGroupActive : styles.statusButtonGroup}
                  variant={`${statusSelected.archived ? 'outline-' : 'outline-'}primary`}
                  onClick={() => setStatus('archived')}
                >
                  Archived
                </Button>
              </ButtonGroup>
              {!documentCannotBeADraft && (statusSelected.archived || statusSelected.published) && (
                <div style={{
                  color: '#6c757d', fontSize: 13, display: 'flex', flexDirection: 'row', marginTop: 8, paddingLeft: 5,
                }}
                >
                  <span>
                    Note: Once a document has been Published or Archived, you will no longer be able to edit its content or revert its status to Draft. If you wish to modify the content of a document in the future, save it as a Draft. (Metadata can always be edited, regardless of document status.)
                  </span>
                </div>
              )}

              <div style={{ marginBottom: 20 }} />
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <Table
                  key="document-status-table"
                  id="document-status-table"
                  headerStyle={{ backgroundColor: '#f7f7f7' }}
                  hoverable={false}
                  columnHeaders={[
                    {
                      header: '',
                      minWidth: 100,
                      style: {
                        padding: 12, borderRight: '1px solid #EBEFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent',
                      },
                    },
                    {
                      header: rowHeader(<EyeFill size={16} color="#424242" />, 'View'),
                      flex: 1,
                      style: {
                        padding: 12, borderRight: '1px solid #EBEFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, backgroundColor: '#f4f4f4',
                      },
                    },
                    {
                      header: rowHeader(<PencilSquare size={16} color="#424242" />, 'Edit'),
                      flex: 1,
                      style: {
                        padding: 12, borderRight: '1px solid #EBEFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, backgroundColor: '#f4f4f4',
                      },
                    },
                    {
                      header: rowHeader(<ChatRightTextFill size={16} color="#424242" />, 'Annotate'),
                      flex: 1,
                      minWidth: 100,
                      style: {
                        padding: 12, borderRight: '1px solid #EBEFF3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500, backgroundColor: '#f4f4f4',
                      },
                    },
                  ]}
                  rows={statusTableRows}
                  fadeOnScroll={false}
                />
              </div>
              <div style={{
                color: '#6c757d', fontSize: 13, display: 'flex', flexDirection: 'row', marginTop: 25,
              }}
              >
                <span style={{ fontSize: 16, marginRight: 2 }}>*</span>
                <span>
                  Only documents created using “Paste or type directly into the form” can be edited, even in Draft mode.
                </span>
              </div>
              <div style={{ flex: 1, marginBottom: 40 }} />
            </div>
          </div>
          <Modal
            id="save-document-modal"
            size="lg"
            show={savingDocument}
            onHide={() => {}}
          >
            <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{
                  flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
                }}
                >
                  {mode === 'edit' ? 'Saving Document' : 'Creating Document'}
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', marginTop: 10, marginBottom: 20, alignItems: 'center', justifyContent: 'center',
              }}
              >
                <ProgressBar style={{ width: '100%' }} now={100} animated />
                <div style={{
                  marginTop: 5, fontWeight: 500, fontSize: 14, color: '#9e9e9e', textAlign: 'center',
                }}
                >
                  {`Do not close browser window or navigate to another link while document is being ${mode === 'edit' ? 'saved' : 'created'}!`}
                </div>
              </div>
            </Modal.Body>
          </Modal>
          <Modal
            id="delete-document-modal"
            size="lg"
            show={showDeleteDocumentModal}
            onHide={deletingDocument ? () => {} : () => setShowDeleteDocumentModal()}
          >
            <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{
                  flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
                }}
                >
                  {`${mode === 'edit' ? 'Delete' : 'Cancel'} Document`}
                </div>
                <div
                  className={styles.cancelUploadBtn}
                  onClick={() => setShowDeleteDocumentModal()}
                >
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
                    {title || 'Untitled'}
                    &quot;
                  </span>
                </div>
                {spacer}
                <div
                  style={{ fontWeight: 'bold', color: '#494949', marginTop: 20 }}
                >
                  {`Are you sure you want to ${mode === 'edit' ? 'delete' : 'cancel'} this document permanently?`}
                </div>
                <div style={{ color: '#494949' }}>This action cannot be undone.</div>
                <div style={{ display: 'flex', flexDirection: 'row', marginTop: 20 }}>
                  {deletingDocument
                    ? <ProgressBar style={{ width: '100%' }} now={100} variant="danger" animated />
                    : (
                      <Button
                        variant="danger"
                        onClick={() => {
                          setDeletingDocument(true);
                          if (mode === 'edit') {
                            // delete document
                            deleteDocumentById(document.id).then((res) => {
                              const doc = res.value;
                              let fObj = doc.fileObj;
                              if (fObj === undefined) {
                                // we need to try to make a processedUrlKey and bucketName and
                                // potentially a urlKey
                                const onlyProcessedUrlKey = doc.uploadContentType === 'text/slate-html';
                                if (doc.text && doc.text.length < 255 && doc.text.includes(cloudfrontUrl) && doc.text.includes('processed/')) {
                                  const s3ProcessedFileName = doc.text.split('processed/')[1];
                                  const key = s3ProcessedFileName.substring(0, s3ProcessedFileName.lastIndexOf('.html'));
                                  fObj = {
                                    urlKey: onlyProcessedUrlKey ? undefined : `files/${key}.pdf`,
                                    processedUrlKey: `processed/${key}.html`,
                                  };
                                }
                              }
                              if (fObj !== undefined) {
                                deleteCloudfrontFiles({
                                  documentOwnerId: doc.owner,
                                  fileObj: fObj,
                                }).then(() => {
                                  onDelete();
                                }).catch((err) => {
                                  setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                                  setShowDeleteDocumentModal();
                                });
                              } else {
                                onDelete();
                              }
                            }).catch((err) => {
                              setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                              setShowDeleteDocumentModal();
                            });
                          } else if (mode === 'new' && fileObj) {
                            // we need to delete any file that was uploaded by the user for this
                            // document
                            deleteCloudfrontFiles({
                              noOwner: true,
                              fileObj,
                            }).then(() => {
                              onDelete();
                            }).catch((err) => {
                              setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                              setShowDeleteDocumentModal();
                            });
                          } else {
                            onDelete();
                          }
                        }}
                      >
                        {`Yes, ${mode === 'edit' ? 'delete' : 'cancel'} this document`}
                      </Button>
                    )}
                </div>
              </div>
            </Modal.Body>
          </Modal>
          <Modal id="upload-document-modal" size="lg" show={showUploadModal} onHide={() => setShowUploadModal()}>
            <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{
                  flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
                }}
                >
                  Upload Document
                </div>
                <div className={styles.cancelUploadBtn} onClick={() => setShowUploadModal()}>
                  <X size={20} />
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'row', marginTop: 50, marginBottom: 70,
              }}
              >
                <div style={{
                  flex: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                }}
                >
                  <img src="/upload-document.svg" height="140" alt="" />
                </div>
                <div style={{
                  display: 'flex', flexDirection: 'column', flex: 3, marginRight: 5,
                }}
                >
                  <div style={{ color: '#898C95', fontSize: 17, fontWeight: 300 }}>Upload PDF, DOCX, ODT, or EPUB</div>
                  <div id="file-input-container">
                    <ReactS3Uploader
                      ref={uploaderRef}
                      signingUrl={process.env.NEXT_PUBLIC_SIGNING_URL}
                      signingUrlMethod="GET"
                      accept=".docx,.pdf,.odt,.epub"
                      s3path="files/"
                      disabled={savingDocument || (progress.started && progress.status !== 'Complete' && progress.status !== 'Failed')}
                      autoUpload={false}
                      onProgress={(percent, stats, file) => {
                        if (fileName === undefined) {
                          setFileName(file.name);
                        }
                        setProgress(
                          {
                            started: true,
                            percent: percent / (100 / origPercent),
                            status: stats,
                          },
                        );
                      }}
                      onError={((msg) => setErrors((prevState) => [...prevState, { text: msg, variant: 'danger' }]))}
                      onFinish={async (signRes, file) => {
                        const fileUrl = signRes.signedUrl.substring(
                          0, signRes.signedUrl.indexOf('?'),
                        );
                        const urlKey = fileUrl.substring(fileUrl.indexOf('files'));
                        const baseCloudfrontURL = fileUrl.substring(
                          0, fileUrl.indexOf('files'),
                        );
                        const processedUrlKey = `processed/${signRes.filename.substring(
                          0, signRes.filename.lastIndexOf('.'),
                        )}.html`;
                        const processedUrl = `${baseCloudfrontURL}${processedUrlKey}`;
                        const fileObject = {
                          name: signRes.filename,
                          size: file.size,
                          contentType: file.type,
                          url: fileUrl,
                          processedUrl,
                          urlKey,
                          processedUrlKey,
                        };
                        await getProcessedDocument(fileObject.processedUrl)
                          .then((res) => {
                            setDocumentText(res);
                            setFileObj(fileObject);
                            setHtmlValue(fileObject.processedUrl);
                            setContentType(fileObject.contentType);
                          })
                          .catch((err) => {
                            setErrors((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
                          });
                      }}
                      uploadRequestHeaders={{ 'x-amz-acl': 'public-read' }}
                      onChange={(ev) => {
                        const size = ev?.target?.files[0]?.size;
                        if (size === undefined) { return; }
                        // checking that file is <= 4MB
                        if (size <= 4000000) {
                          setOnChangeMsg({ msg: 'Uploading file.', color: '#10A268' });
                          uploaderRef.current.uploadFile();
                        } else {
                          setOnChangeMsg({ msg: `File size to large ${(size / 1000000).toFixed(1)}MB, upload a new file.`, color: '#E20101' });
                          uploaderRef.current.abort();
                          uploaderRef.current.clear();
                        }
                      }}
                      onBlur={() => {}}
                    />
                  </div>
                  <div style={{
                    color: '#888E9F', fontSize: 16, marginTop: 10, paddingLeft: 2, fontWeight: 300,
                  }}
                  >
                    Limit: 4 MB (file size may increase during processing)
                  </div>
                  {onChangeMsg?.msg && (
                  <div style={{
                    fontSize: 14, fontWeight: 'bold', color: onChangeMsg.color || '#888E9F', marginTop: 15, paddingLeft: 2,
                  }}
                  >
                    {onChangeMsg.msg}
                  </div>
                  )}
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </>
        )}
      </Layout>
      <style jsx global>
        {`
        #upload-document-modal {
          border-radius: 4px;
          border: none;
        }
        #file-input-container {
          margin-top: 10px;
          background-color: #f9f9f9;
          border: 1px solid #f0f0f0;
          border-radius: 2px;
        }

        #file-input-container input {
          color: #9E9E9E;
        }

        #file-input-container input::file-selector-button {
          background-color: #355CBC;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 2px;
          margin-right: 8px;
        }
        [data-testid='slate-toolbar'] {
          border-radius: 0px;
        }

        [data-testid='slate-toolbar'] {
          border-radius: 0px;
        }

        #outline-container-container {
          height: calc(100% - 50px);
          padding: 30px 0px 40px 0px;
          overflow: overlay;
          position: relative;
        }

        #outline-container {
          background: white;
          transition: left 0.5s;
          position: absolute;
          left: ${slateDocPos};
          background: white;
          width: ${documentWidth}px;
          min-height: 971px !important;
          height: auto !important;
          margin: 0px 20px;
          border: none;
          border-radius: 0px;
          box-shadow: 3px 3px 9px 0px rgb(0 0 0 / 38%) !important;
          outline: none !important;
          resize: none;
        }


        [text-analysis='true'] {
          transition: background-color 0.25s;
        }

        .ta-success[text-analysis='true'] {
          background-color: rgba(2, 112, 255, 0.2);
        }

        .ta-success[text-analysis='true'].hover {
          background-color: rgba(2, 78, 255, 0.6);
        }

        .ta-comment[text-analysis='true'] {
          background-color: rgba(150, 150, 150, 0.2);
        }

        .ta-comment[text-analysis='true'].hover {
          background-color: rgba(150, 150, 150, 0.4);
        }

        .ta-warning[text-analysis='true'] {
          background-color: rgba(255, 210, 10, 0.3);
        }

        .ta-warning[text-analysis='true'].hover {
          background-color: rgba(255, 210, 10, 0.6);
        }

        .ta-danger[text-analysis='true'] {
          background-color: rgba(255, 59, 10, 0.3);
        }

        .ta-danger[text-analysis='true'].hover {
          background-color: rgba(255, 59, 10, 0.6);
        }
        
        body {
          overflow: hidden !important;
        }

        #annotations-header-label {
          padding: 12px 0px 0px 20px;
        }

        #document-container {
          height: calc(100vh - ${200}px);
          transition: height 0.5s;
          overflow-y: overlay !important;
          overflow-x: overlay !important;
          padding: 25px 0px 15px 0px;
        }

        #document-inner-container {
          display: flex;
          flex-direction: row;
          width: calc(100% + ${extraWidth}px);
        }

        

        #document-container .annotation-channel-container{
          height: 0px;
          flex: 1;
          position: relative;
          z-index: 2;
          top: -25px;
        }
        
        #document-container #annotation-well-card-container {
          min-height: 100%;
          background-color: transparent;
        }

        #document-container #document-card-container {
          min-height: 971px;
          padding: 40px;
          font-family: 'Times';
          border-radius: 0px;
          border: none;
          box-shadow: ${documentIsPDF
          ? 'none'
          : '3px 3px 9px 0px rgba(0,0,0,0.38)'
          };
          ${documentIsPDF ? 'background: none;' : ''}
        }

        #document-container #annotation-well-card-container .card-body {
          padding: 10px;
        }
            
        #document-container #annotation-well-card-container .card-body #annotation-well-header {
            margin-bottom: 10px;
        }

        #document-container #annotation-well-card-container .card-body #annotation-list-container > .col > .row {
          margin-bottom: 5px;
        }  

        #document-container #annotation-well-card-container .card-body #annotation-list-container > .col > .row .card {
          border: none;
          box-shadow: 0px 0px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
        }

        #document-container #annotation-well-card-container .card-body .btn-group:first-child {
            margin-right: 10px;
        }

        #document-container #annotation-well-card-container .card-body .list-group-item {
            padding: 5px 10px;
        }

        .text-currently-being-annotated.active {
          background-color: rgba(0, 123, 255, 0.5);
        }

        #show-cannot-annotate-document-toast-container {
          z-index: 1;
          position: relative;
          left: 10px;
          top: 10px;
          height: 0px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }

        #show-cannot-annotate-document-toast-container .toast {
          border-color: rgb(220, 53, 70) !important;
        }

        #show-cannot-annotate-document-toast-container .toast-header {
          background-color: rgba(220, 53, 70, 0.85) !important;
          color: white !important; 
        }

        #show-cannot-annotate-document-toast-container .toast-header button {
          color: white !important;
        }

        #comment-card-left-pointer, #comment-card-middle-pointer, #comment-card-right-pointer {
          display: none;
        }

        .left #comment-card-left-pointer, .middle #comment-card-middle-pointer, .right #comment-card-right-pointer {
          display: block !important;
        }
      `}
      </style>
    </>
  );
};

/*
<Col lg="12" className="mx-auto">
  <Card style={{ marginBottom: 30 }}>
    {((!session && loading) || (session && pageLoading)) && (
      <LoadingSpinner />
    )}
    {!session && !loading && (
      <UnauthorizedCard />
    )}
    {session && !loading && !pageLoading && (
      <>
        <Card.Header><Card.Title>Create a new document</Card.Title></Card.Header>
        <Card.Body>
          <DocumentForm
            mode="new"
            session={session}
            setErrors={setErrors}
            errors={errors}
            setPageLoading={setPageLoading}
          />
        </Card.Body>
      </>
    )}
  </Card>
</Col>
*/

export default CreateEditDocument;
