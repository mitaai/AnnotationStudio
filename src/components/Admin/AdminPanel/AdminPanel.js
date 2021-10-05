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

const AdminPanel = ({
  setAlerts, session, activeKey, setKey,
}) => {
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [data, setData] = useState([]);
  const [sortState, setSortState] = useState({ field: 'createdAt', direction: 'desc' });
  const perPage = 10;

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
            console.log(results);
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

  return (
    <Card data-testid="admin-panel">
      <AdminHeader activeKey={activeKey} setKey={setKey} />
      <Card.Body>
        {listLoading && activeKey !== 'dashboard' && (
          <LoadingSpinner />
        )}
        {activeKey === 'dashboard' && (<AdminDashboard />)}
        {!listLoading && activeKey !== 'dashboard' && false && (
          <Paginator
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        )}
        {!listLoading && activeKey !== 'dashboard' && <InputGroup className="mb-3">
          <InputGroup.Text id="basic-addon1">
            <Search size={14} />
          </InputGroup.Text>
          <FormControl
            placeholder={`Search ${activeKey}`}
            onChange={console.log}
            aria-label="Username"
            aria-describedby="basic-addon1"
          />
        </InputGroup>}
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
      </Card.Body>
    </Card>
  );
};

export default AdminPanel;
