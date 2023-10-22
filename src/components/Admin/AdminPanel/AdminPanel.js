/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-underscore-dangle */
import { useState, useEffect, useRef } from 'react';
import {
  Card, InputGroup, FormControl, Button, Modal,
} from 'react-bootstrap';
import {
  ArrowDown, ArrowDownUp, ArrowUp, Search, X,
} from 'react-bootstrap-icons';
import { debounce } from 'lodash';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../User/AdminUserList';
import AdminDocumentList from '../Document/AdminDocumentList';
import AdminGroupList from '../Group/AdminGroupList';
import AdminHeader from '../AdminHeader';
import { getUsersByIds } from '../../../utils/userUtil';
import { searchForDocuments, searchForGroups, searchForUsers } from '../../../utils/docUtil';
import AddNewUserForm from './AddNewUserForm';

import styles from './AdminPanel.module.scss';

const AdminPanel = ({
  setAlerts, activeKey, setKey, // session,
}) => {
  const [usersListData, setUsersListData] = useState();
  const [documentsListData, setDocumentsListData] = useState();
  const [groupsListData, setGroupsListData] = useState();
  const [queryData, setQueryData] = useState({
    users: {
      query: '',
      page: 1,
      nextPage: true,
      loading: false,
    },
    documents: {
      query: '',
      page: 1,
      nextPage: true,
      loading: false,
    },
    groups: {
      query: '',
      page: 1,
      nextPage: true,
      loading: false,
    },
  });
  const [usersSortState, setUsersSortState] = useState({ field: 'createdAt', direction: 'desc' });
  const [documentsSortState, setDocumentsSortState] = useState({ field: 'createdAt', direction: 'desc' });
  const [groupsSortState, setGroupsSortState] = useState({ field: 'createdAt', direction: 'desc' });
  const [namesState, setNamesState] = useState({});
  const perPage = 20;

  const [showAddUserModal, setShowAddUserModal] = useState();

  const SortIcon = ({ field }) => {
    let sortState;
    if (activeKey === 'users') {
      sortState = usersSortState;
    } else if (activeKey === 'documents') {
      sortState = documentsSortState;
    } else if (activeKey === 'groups') {
      sortState = groupsSortState;
    }
    if (field === sortState.field) {
      if (sortState.direction === 'desc') return <ArrowDown />;
      return <ArrowUp />;
    } return <ArrowDownUp style={{ fill: 'gray' }} />;
  };

  const searchData = async ({
    query, activeKey: activeK, page, perPage: perP, sort,
  }) => {
    const saveQueryData = (arr) => {
      // we need to check if there is possibly a nextPage to view
      setQueryData((prevQueryData) => {
        const newQueryData = { ...prevQueryData };
        newQueryData[activeK].nextPage = arr.length === perP;
        newQueryData[activeK].loading = false;
        return newQueryData;
      });
    };

    const formattedSort = {
      [sort.field]: sort.direction === 'asc' ? 1 : -1,
    };

    // if (query.length === 0) return;
    if (activeK === 'users') {
      await searchForUsers({
        query, page, perPage: perP, sort: formattedSort,
      }).then((res) => {
        console.log('res: ', res)
        if (page === 1) {
          setUsersListData(res.users);
        } else {
          setUsersListData((prevUsersListData) => prevUsersListData.concat(res.users));
        }
        saveQueryData(res.users);
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      });
    } else if (activeK === 'documents') {
      await searchForDocuments({
        query, page, perPage: perP, sort: formattedSort,
      }).then((res) => {
        if (page === 1) {
          setDocumentsListData(res.documents);
        } else {
          setDocumentsListData(
            (prevDocumentsListData) => prevDocumentsListData.concat(res.documents),
          );
        }
        saveQueryData(res.documents);
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      });
    } else if (activeK === 'groups') {
      await searchForGroups({
        query, page, perPage: perP, sort: formattedSort,
      }).then((res) => {
        if (page === 1) {
          setGroupsListData(res.groups);
        } else {
          setGroupsListData((prevGroupsListData) => prevGroupsListData.concat(res.groups));
        }

        saveQueryData(res.groups);
      }).catch((err) => {
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
      });
    }
  };

  const searchDataDebounced = useRef(
    debounce(searchData, 1500),
  ).current;


  const updateSearchResults = (q) => {
    // first search
    let sortState = {};
    if (activeKey === 'users') {
      sortState = usersSortState;
    } else if (activeKey === 'documents') {
      sortState = documentsSortState;
    } else if (activeKey === 'groups') {
      sortState = groupsSortState;
    }
    searchDataDebounced({
      query: q, activeKey, page: 1, perPage, sort: sortState,
    });

    if (activeKey === 'users') {
      setUsersListData();
    } else if (activeKey === 'documents') {
      setDocumentsListData();
    } else if (activeKey === 'groups') {
      setGroupsListData();
    }

    // then update query value
    setQueryData((prevQueryData) => {
      const newQueryData = { ...prevQueryData };
      newQueryData[activeKey].query = q;
      // whenever the query changes we automatically go back to the first page of results because
      // its a new query
      newQueryData[activeKey].page = 1;
      // and we assume that there is a next page to query
      newQueryData[activeKey].nextPage = true;
      // we are loading information if there is a query
      newQueryData[activeKey].loading = true;
      return newQueryData;
    });
  };

  useEffect(() => {

  }, [usersSortState]);
  useEffect(() => {
    if (!Object.keys(queryData).includes(activeKey)) return;
    let sortState = {};
    if (activeKey === 'users') {
      sortState = usersSortState;
    } else if (activeKey === 'documents') {
      sortState = documentsSortState;
    } else if (activeKey === 'groups') {
      sortState = groupsSortState;
    }
    const q = queryData[activeKey].query;
    searchData({
      query: q || '', activeKey, page: 1, perPage, sort: sortState,
    });
    setQueryData((prevQueryData) => {
      const newQueryData = { ...prevQueryData };
      // if we change the sort state we go back to page 1
      newQueryData[activeKey].page = 1;
      // and we need to set loading to true because it will take a second to get results
      // newQueryData[activeKey].loading = q.length > 0;
      return newQueryData;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usersSortState, documentsSortState, groupsSortState]);
  useEffect(() => {

  }, [groupsSortState]);

  useEffect(() => {
    async function fetchData() {
      if (documentsListData && Array.isArray(documentsListData) && documentsListData.length > 0) {
        // first we need to filter document owners by if !namesState[doc.owner] is true and map
        // them to a list of user ids
        const userIds = documentsListData
          .filter((doc) => !namesState[doc.owner]).map((doc) => doc.owner);
        if (userIds.length === 0) return;
        const defaultUserObj = userIds.reduce((obj, item) => {
          // eslint-disable-next-line no-param-reassign
          obj[item] = '[user not found]';
          return obj;
        }, {});
        let usersObj;
        await getUsersByIds(userIds).then((result) => {
          const { users } = result;
          // the function inside the reduce method reduces the array to an object mapping user id
          // to user name
          usersObj = users.reduce((obj, { _id, name }) => {
            // eslint-disable-next-line no-param-reassign
            obj[_id] = name;
            return obj;
          }, defaultUserObj);
        }).catch(() => {});
        const obj = usersObj || defaultUserObj;
        setNamesState({ ...namesState, ...obj });
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentsListData]);

  useEffect(() => {
    if ((activeKey === 'users' && usersListData === undefined)
      || (activeKey === 'documents' && documentsListData === undefined)
      || (activeKey === 'groups' && groupsListData === undefined)) {
      updateSearchResults('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  return (
    <>
      <Card id="admin-panel-card" data-testid="admin-panel">
        <AdminHeader activeKey={activeKey} setKey={setKey} />
        <Card.Body style={{ display: 'flex', flexDirection: 'column' }}>
          {activeKey === 'dashboard' && (<AdminDashboard />)}
          {activeKey !== 'dashboard' && (
          <div style={{ position: 'relative', display: 'flex', flexDireciton: 'row' }}>
            <InputGroup className="mb-3">
              <InputGroup.Text id="search-icon-container">
                <Search size={14} />
              </InputGroup.Text>
              <FormControl
                id="admin-panel-search-input"
                placeholder={`Search ${activeKey}`}
                value={queryData[activeKey]?.query || ''}
                onChange={(ev) => updateSearchResults(ev.target.value)}
                aria-label="Username"
                aria-describedby="basic-addon1"
              />
            </InputGroup>
            <Button
              onClick={() => setShowAddUserModal(true)}
              style={{ height: 38, width: 130, marginLeft: 5 }}
            >
              Add user
            </Button>
            <Modal show={showAddUserModal} onHide={() => setShowAddUserModal()}>
              <Modal.Body>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                  <div style={{
                    flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5, marginBottom: 20,
                  }}
                  >
                    Add New User
                  </div>
                  <div
                    style={{ marginBottom: 15 }}
                    className={styles.closeModalBtn}
                    onClick={() => setShowAddUserModal()}
                  >
                    <X size={20} />
                  </div>
                </div>
                <AddNewUserForm onHide={() => setShowAddUserModal()} setAlerts={setAlerts} />
              </Modal.Body>
            </Modal>
          </div>
          )}
          <div style={{ flex: 1, overflowY: 'overlay', display: 'flex' }}>
            {activeKey === 'users' && (
            <AdminUserList
              users={usersListData}
              loading={queryData[activeKey].loading}
              loadMoreResults={queryData[activeKey].nextPage
                ? () => {
                  searchData({
                    query: queryData[activeKey]?.query,
                    activeKey,
                    page: queryData[activeKey]?.page + 1,
                    perPage,
                    sort: usersSortState,
                  });
                  setQueryData((prevQueryData) => {
                    const newQueryData = { ...prevQueryData };
                    // we need to increment the page count
                    newQueryData[activeKey].page += 1;
                    // and we need to set loading to true because it will take a second to get more
                    // results
                    newQueryData[activeKey].loading = true;
                    return newQueryData;
                  });
                }
                : undefined}
              sortState={usersSortState}
              setSortState={setUsersSortState}
              SortIcon={SortIcon}
            />
            )}
            {activeKey === 'documents' && (
            <AdminDocumentList
              documents={documentsListData}
              loading={queryData[activeKey].loading}
              loadMoreResults={queryData[activeKey].nextPage
                ? () => {
                  searchData({
                    query: queryData[activeKey]?.query,
                    activeKey,
                    page: queryData[activeKey]?.page + 1,
                    perPage,
                    sort: documentsSortState,
                  });
                  setQueryData((prevQueryData) => {
                    const newQueryData = { ...prevQueryData };
                    // we need to increment the page count
                    newQueryData[activeKey].page += 1;
                    // and we need to set loading to true because it will take a second to get more
                    // results
                    newQueryData[activeKey].loading = true;
                    return newQueryData;
                  });
                }
                : undefined}
              namesState={namesState}
              sortState={documentsSortState}
              setSortState={setDocumentsSortState}
              SortIcon={SortIcon}
            />
            )}
            {activeKey === 'groups' && (
            <AdminGroupList
              groups={groupsListData}
              loading={queryData[activeKey].loading}
              loadMoreResults={queryData[activeKey].nextPage
                ? () => {
                  searchData({
                    query: queryData[activeKey]?.query,
                    activeKey,
                    page: queryData[activeKey]?.page + 1,
                    perPage,
                    sort: groupsSortState,
                  });
                  setQueryData((prevQueryData) => {
                    const newQueryData = { ...prevQueryData };
                    // we need to increment the page count
                    newQueryData[activeKey].page += 1;
                    // and we need to set loading to true because it will take a second to get more
                    // results
                    newQueryData[activeKey].loading = true;
                    return newQueryData;
                  });
                }
                : undefined}
              sortState={groupsSortState}
              setSortState={setGroupsSortState}
              SortIcon={SortIcon}
            />
            )}
          </div>

        </Card.Body>
      </Card>
      <style jsx global>
        {`
        #admin-panel-card {
          height: 100%;
        }
        #admin-panel-search-input {
          box-shadow: none;
        }
        #search-icon-container {
          border-right-width: 0px;
          border-top-right-radius: 0px;
          border-bottom-right-radius: 0px;
        }
      `}
      </style>
    </>
  );
};

export default AdminPanel;
