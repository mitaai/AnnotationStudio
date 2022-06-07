/* eslint-disable no-underscore-dangle */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Button, Modal, Spinner,
} from 'react-bootstrap';
import {
  ChevronCompactRight, Plus, Search, X, Check,
} from 'react-bootstrap-icons';
import { createEditor } from 'slate';
import {
  Slate, withReact,
} from 'slate-react';
import {
  DEFAULTS_LIST,
  DEFAULTS_TABLE,
  EditablePlugins,
  pipe,
  withCodeBlock,
  withDeserializeHTML,
  withImageUpload,
  withInlineVoid,
  withList,
  withMarks,
  withTable,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import Layout from '../Layout';
import UnauthorizedCard from '../UnauthorizedCard';
import LoadingSpinner from '../LoadingSpinner';
import DocumentForm from '../DocumentForm';
import SlateToolbar from '../SlateToolbar';
import Select from '../Select';
import styles from './CreateEditDocument.module.scss';
import { plugins, withDivs } from '../../utils/slateUtil';
import SelectInput from '../SelectInput';
import TileBadge from '../TileBadge';
import { getGroupsByGroupIds } from '../../utils/groupUtil';
import { DeepCopyObj } from '../../utils/docUIUtils';

const CreateEditDocument = ({
  statefulSession, document, session, loading,
}) => {
  const [groups, setGroups] = useState([]);
  const [groupData, setGroupData] = useState([]);
  const [errors, setErrors] = useState([]);

  const [changesMade, setChangesMade] = useState();
  const [initialMount, setInitialMount] = useState(true);

  const [minimize, setMinimize] = useState();
  const [showUploadModal, setShowUploadModal] = useState();
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState();

  const [slateDocument, setSlateDocument] = useState();
  const [slateLoading, setSlateLoading] = useState();

  const [fileName, setFileName] = useState();

  /*
    Properties of metadata form
  */
  const [showAdditionalMetadata, setShowAdditionalMetadata] = useState();
  const [title, setTitle] = useState(document?.title || '');
  const [typeOfResource, setTypeOfResource] = useState(document?.resourceType || 'book');
  const [status, setStatus] = useState(document?.state);
  const [contributors, setContributors] = useState(document?.contributors || [{ type: 'Author', name: '' }]);
  // aditional metadata
  const [publicationDate, setPublicationDate] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publisherLocation, setPublisherLocation] = useState('');
  const [rightsStatus, setRightsStatus] = useState('copyrighted');
  const [volume, setVolume] = useState('');
  const [edition, setEdition] = useState('');
  const [series, setSeries] = useState('');
  const [numberInSeries, setNumberInSeries] = useState('');
  const [url, setUrl] = useState('');
  const [dateAccessed, setDateAccessed] = useState(new Date(document.accessed) || new Date());

  // life cycle of this state
  // 2) waiting to be used
  // 1) in use
  // 0) not in use and then sent back to state = 2
  const [addingContributor, setAddingContributor] = useState(2);
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
    const newContributors = contributors.slice();
    newContributors.splice(index, 1);
    setContributors(newContributors);
  };

  const addGroup = (grp) => {
    const g = DeepCopyObj(grp);
    const newGroupsShared = DeepCopyObj(groupsShared);
    const newOrderOfGroupsShared = DeepCopyObj(orderOfGroupsShared);
    const ids = g.members.filter(({ role }) => role === 'owner' || role === 'manager').map((m) => m.id);
    if (ids.includes(session.user.id)) {
      newGroupsShared.core[g._id] = g;
      newOrderOfGroupsShared.core.push(g._id);
    } else {
      newGroupsShared.contributions[g._id] = g;
      newOrderOfGroupsShared.contributions.push(g._id);
    }

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

  const transition = 'all 0.5s';
  const border = '1px solid #dddddd';
  const states = {
    default: {
      leftPanel: {
        left: 0,
        width: 'calc(100vw - 450px)',
      },
      rightPanel: {
        left: 'calc(100vw - 450px)',
        width: 450,
      },
      chevron: {
        left: 'calc(100vw - 450px - 20px)',
        transform: 'rotate(-45deg)',
      },
      chevronSpan: {
        top: 3,
        left: 6,
        transform: 'rotate(45deg)',
      },
    },
    minimize: {
      leftPanel: {
        left: 0,
        width: 'calc(100vw - 20px)',
      },
      rightPanel: {
        left: 'calc(100vw - 20px)',
        width: 450,
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
  };

  const state = states[minimize ? 'minimize' : 'default'];

  const secondNavbarExtraContent = (
    <div style={{
      position: 'absolute', top: -8, left: -33, height: 64,
    }}
    >
      <div style={{
        position: 'absolute', transition, left: `calc(100vw - ${minimize ? 233 : 450}px)`, height: '100%', display: 'flex', flexDirection: 'row',
      }}
      >
        {document === undefined ? (
          <Button
            className={styles.uploadDocumentBtn}
            style={{
              transition,
              left: -112 + (minimize ? 5 : 0),
            }}
            onClick={() => setShowUploadModal(true)}
            disabled={fileName !== undefined}
          >
            Upload
          </Button>
        ) : (
          <Button
            className={styles.cancelChangesBtn}
            style={{
              transition,
              left: -92 + (minimize ? 5 : 0),
            }}
            onClick={() => setShowUploadModal(true)}
            disabled={fileName !== undefined}
          >
            Cancel
          </Button>
        )}
        <div style={{
          transition,
          height: 44,
          width: 1,
          backgroundColor: '#dddddd',
          margin: `auto ${minimize ? 0 : 12}px auto 0px`,
          opacity: minimize ? 0 : 1,
        }}
        />
        {document === undefined
          ? (
            <Button
              className={styles.createNewDocumentBtn}
              onClick={() => {}}
            >
              Create Document
            </Button>
          )
          : (
            <Button
              className={styles.saveChangesBtn}
              onClick={() => {}}
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

  const queriedGroups = groupData.filter(({ name }) => {
    // eslint-disable-next-line no-useless-escape
    const r = groupQuery ? new RegExp(`\.\*${groupQuery}\.\*`, 'i') : new RegExp('\.\*', 'i');
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
                  addGroup(g);
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
    slateDocument, title, typeOfResource, status, contributors, publicationDate, publisher,
    publisherLocation, rightsStatus, volume, edition, series, numberInSeries, url,
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
        secondNavbarExtraContent={secondNavbarExtraContent}
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
              {fileName ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div
                    className={styles.gradient}
                    style={{
                      display: 'flex', flexDirection: 'row', alignItems: 'center', height: 49, backgroundColor: '#F0F0F0', borderBottom: '1px solid #ced4da', paddingLeft: 52, paddingRight: 13,
                    }}
                  >
                    <span style={{ color: '#616161', fontWeight: 400, marginRight: 'auto' }}>{fileName}</span>
                    <div className={styles.cancelUploadBtn} onClick={() => setFileName()}>
                      <X size={20} />
                    </div>
                  </div>
                </div>
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
                  {slateLoading && (
                  <div className={styles['slate-loader']}>
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
                  <div id="outline-container-container" style={{ paddingBottom: 40 }}>
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
                      placeholder="Paste or type here"
                      id="outline-container"
                      className={styles['slate-editor']}
                    />
                  </div>

                </Slate>
              )}
            </div>
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
                transition,
                ...state.rightPanel,
              }}
            >
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
              <input
                placeholder={fileName || 'Untitled'}
                style={{
                  marginBottom: 20,
                }}
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
              />
              <div style={{
                fontSize: 16, color: '#424242', fontWeight: 'bold', marginBottom: 10,
              }}
              >
                Type Of Resource
              </div>
              <div style={{ marginBottom: 20 }}>
                <Select
                  options={[
                    { text: 'Book', key: 'Book' },
                    { text: 'Book Section', key: 'Book Section' },
                    { text: 'Journal Article', key: 'Journal Article' },
                    { text: 'Magazine Article', key: 'Magazine Article' },
                    { text: 'Newspaper Article', key: 'Newspaper Article' },
                    { text: 'Web Page', key: 'Web Page' },
                    { text: 'Other', key: 'Other' },
                  ]}
                  selectedOptionKey={typeOfResource}
                  setSelectedOptionKey={setTypeOfResource}
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
                  minHeight: showAdditionalMetadata ? 450 : 0,
                  opacity: showAdditionalMetadata ? 1 : 0,
                }}
              >
                <div style={{ display: 'flex', flexDireciton: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Publication Date</div>
                    <input
                      placeholder="Date"
                      value={publicationDate}
                      onChange={(ev) => setPublicationDate(ev.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Publisher</div>
                    <input
                      placeholder="Publisher"
                      value={publisher}
                      onChange={(ev) => setPublisher(ev.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDireciton: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Publication Location</div>
                    <input
                      placeholder="Location"
                      value={publisherLocation}
                      onChange={(ev) => setPublisherLocation(ev.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Rights Status</div>
                    <Select
                      options={[
                        { text: 'Copyrighted', key: 'Copyrighted' },
                        { text: 'Creative Commons', key: 'Creative Commons' },
                        { text: 'Public Domain', key: 'Public Domain' },
                      ]}
                      selectedOptionKey={rightsStatus}
                      setSelectedOptionKey={setRightsStatus}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDireciton: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Volume</div>
                    <input
                      placeholder="Volume"
                      value={volume}
                      onChange={(ev) => setVolume(ev.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Edition</div>
                    <input
                      placeholder="Edition"
                      value={edition}
                      onChange={(ev) => setEdition(ev.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDireciton: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Series</div>
                    <input
                      placeholder="Series"
                      value={series}
                      onChange={(ev) => setSeries(ev.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Number in series</div>
                    <input
                      placeholder="Number"
                      value={numberInSeries}
                      onChange={(ev) => setNumberInSeries(ev.target.value)}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDireciton: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>URL</div>
                    <input
                      placeholder="URL"
                      value={url}
                      onChange={(ev) => setUrl(ev.target.value)}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className={styles.additionalMetadataHeaders}>Date Accessed</div>
                    <input
                      placeholder="Date"
                      value={dateAccessed}
                      onChange={(ev) => setDateAccessed(ev.target.value)}
                    />
                  </div>
                </div>
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
              <Select
                options={[
                  { text: 'Draft', key: 'draft' },
                  { text: 'Published', key: 'published' },
                  { text: 'Archived', key: 'Archived' },
                ]}
                selectedOptionKey={status}
                setSelectedOptionKey={setStatus}
              />
              <div style={{ flex: 1, marginBottom: 40 }} />
              {spacer}
              <div
                style={{ marginTop: 40 }}
                className={styles.deleteDocumentBtn}
                onClick={() => setShowDeleteDocumentModal(true)}
              >
                Delete Document
              </div>
            </div>
          </div>
          <Modal
            id="delete-group-modal"
            size="lg"
            show={showDeleteDocumentModal}
            onHide={() => setShowDeleteDocumentModal()}
          >
            <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <div style={{
                  flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
                }}
                >
                  Delete Group
                </div>
                <div
                  className={styles.cancelUploadBtn}
                  onClick={() => setShowDeleteDocumentModal()}
                >
                  <X size={20} />
                </div>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'row', marginTop: 50, marginBottom: 70,
              }}
              >
                <Button
                  variant="danger"
                  onClick={() => {}}
                >
                  Delete Document
                </Button>
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
                    <input
                      type="file"
                      onChange={(ev) => setFileName(ev.target.value.split('C:\\fakepath\\')[1])}
                    />
                  </div>
                  <div style={{
                    color: '#888E9F', fontSize: 16, marginTop: 10, paddingLeft: 2, fontWeight: 300,
                  }}
                  >
                    Limit: 4 MB (file size may increase during processing)
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 'bold', color: '#888E9F', marginTop: 15, paddingLeft: 2,
                  }}
                  >
                    Do not close broswer window while the file is being processed
                  </div>
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

        #outline-container-container {
          height: calc(100vh - 250px);
          padding: 20px 0px;
          overflow: scroll;
        }

        #outline-container {
          background: white;
          width: 750px;
          min-height: 971px !important;
          height: auto !important;
          margin: 0px auto;
          border: none;
          border-radius: 0px;
          box-shadow: 3px 3px 9px 0px rgb(0 0 0 / 38%) !important;
          outline: none !important;
          resize: none;
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
