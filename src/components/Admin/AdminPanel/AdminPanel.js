/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import { Card, InputGroup, FormControl } from 'react-bootstrap';
import { ArrowDown, ArrowDownUp, ArrowUp, Search } from 'react-bootstrap-icons';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../User/AdminUserList';
import AdminDocumentList from '../Document/AdminDocumentList';
import AdminGroupList from '../Group/AdminGroupList';
import AdminHeader from '../AdminHeader';
import { adminGetList } from '../../../utils/adminUtil';
import LoadingSpinner from '../../LoadingSpinner';
import Paginator from '../../Paginator';
import { getUsersByIds } from '../../../utils/userUtil';

const AdminPanel = ({
  setAlerts, session, activeKey, setKey,
}) => {
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [data, setData] = useState([]);
  const [sortState, setSortState] = useState({ field: 'createdAt', direction: 'desc' });
  const [namesState, setNamesState] = useState({});
  const perPage = 50;

  const SortIcon = ({ field }) => {
    if (field === sortState.field) {
      if (sortState.direction === 'desc') return <ArrowDown />;
      return <ArrowUp />;
    } return <ArrowDownUp style={{ fill: 'gray' }} />;
  };

  const fetchData = async (effect) => {
    if (session) {
      setListLoading(true);
      if (effect !== 'page') setPage(1);
      if (effect !== 'sortState') setTotalPages(1);
      if (effect === 'activeKey') setSortState({ field: 'createdAt', direction: 'desc' });
      if (activeKey !== 'dashboard') {
        const { field, direction } = sortState;
        let params = '';
        if (field === 'createdAt') {
          params = `?page=${page}&perPage=${perPage}&order=${direction}`;
        } else {
          params = `?page=${page}&perPage=${perPage}&sort=${field}&order=${direction}`;
        }
        await adminGetList(activeKey, params)
          .then((results) => {
            if (effect !== 'sortState') setTotalPages(Math.ceil((results.count) / perPage));
            setData(results);
            setListLoading(false);
          })
          .catch((err) => {
            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
            setListLoading(false);
          });
      }
    }
  };

  useEffect(() => { fetchData('activeKey'); }, [activeKey]);
  useEffect(() => { fetchData('page'); }, [page]);
  useEffect(() => { fetchData('sortState'); }, [sortState]);
  useEffect(() => {
    async function fetchData() {
      const { documents } = data;
      if (documents && Array.isArray(documents) && documents.length > 0) {
        // first we need to filter document owners by if !namesState[doc.owner] is true and map them to a list of user ids
        const userIds = documents.filter((doc) => !namesState[doc.owner]).map((doc) => doc.owner);
        const defaultUserObj = userIds.reduce((obj, item) => {
          obj[item] = '[user not found]';
          return obj;
        }, {});
        let userObj = undefined;
        await getUsersByIds(userIds).then((result) => {
          const { users } = result;
          // the function inside the reduce method reduces the array to an object mapping user id to user name
          usersObj = users.reduce((obj, { _id, name }) => {
            obj[_id] = name;
            return obj;
          }, defaultUserObj); 
        }).catch(() => {});
        setNamesState(userObj || defaultUserObj);
      }
    }
    fetchData();
  }, [data]);

  return (<>
    <Card id="admin-panel-card" data-testid="admin-panel">
      <AdminHeader activeKey={activeKey} setKey={setKey} />
      <Card.Body style={{ display: 'flex', flexDirection: 'column' }}>
        {listLoading && activeKey !== 'dashboard' && (
          <LoadingSpinner />
        )}
        {activeKey === 'dashboard' && (<AdminDashboard />)}
        {!listLoading && activeKey !== 'dashboard' && <div style={{ position: 'relative' }}>
          <InputGroup className="mb-3">
            <InputGroup.Text id="search-icon-container">
              <Search size={14} />
            </InputGroup.Text>
            <FormControl
              placeholder={`Search ${activeKey}`}
              onChange={console.log}
              aria-label="Username"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
        </div>}
        <div style={{ flex: 1, overflowY: 'overlay', display: 'flex' }}>
          {!listLoading && activeKey === 'users' && data.users && (
            <AdminUserList
              users={data.users}
              sortState={sortState}
              setSortState={setSortState}
              SortIcon={SortIcon}
            />
          )}
          {!listLoading && activeKey === 'documents' && data.documents && (
            <AdminDocumentList
              documents={data.documents}
              namesState={namesState}
              sortState={sortState}
              setSortState={setSortState}
              SortIcon={SortIcon}
            />
          )}
          {!listLoading && activeKey === 'groups' && data.groups && (
            <AdminGroupList
              groups={data.groups}
              sortState={sortState}
              setSortState={setSortState}
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
