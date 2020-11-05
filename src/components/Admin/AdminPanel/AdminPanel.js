/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import {
  Card, Pagination,
} from 'react-bootstrap';
import { ArrowDown, ArrowDownUp, ArrowUp } from 'react-bootstrap-icons';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../User/AdminUserList';
import AdminDocumentList from '../Document/AdminDocumentList';
import AdminGroupList from '../Group/AdminGroupList';
import AdminHeader from '../AdminHeader';
import { adminGetList } from '../../../utils/adminUtil';
import LoadingSpinner from '../../LoadingSpinner';

const AdminPanel = ({
  alerts, setAlerts, session, activeKey, setKey,
}) => {
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [data, setData] = useState([]);
  const [sortState, setSortState] = useState({ field: 'createdAt', direction: 'desc' });
  const perPage = 20;

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
          .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]));
      }
    }
  };

  useEffect(() => { fetchData('activeKey'); }, [activeKey]);
  useEffect(() => { fetchData('page'); }, [page]);
  useEffect(() => { fetchData('sortState'); }, [sortState]);

  return (
    <Card>
      <AdminHeader activeKey={activeKey} setKey={setKey} />
      <Card.Body>
        {listLoading && activeKey !== 'dashboard' && (
          <LoadingSpinner />
        )}
        {activeKey === 'dashboard' && (<AdminDashboard />)}
        {!listLoading && activeKey !== 'dashboard' && (
          <Pagination style={{ justifyContent: 'center' }}>
            <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
            <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
            {page !== 1
              && (
                <>
                  {[...Array(page).keys()].map((i) => (
                    i + 1 < page && (
                      <Pagination.Item
                        key={`page${i + 1}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    )
                  ))}
                </>
              )}
            <Pagination.Item active>{page}</Pagination.Item>
            {totalPages > 1
              && (
                <>
                  {[...Array(totalPages).keys()].map((i) => (
                    i + 1 > page && (
                      <Pagination.Item
                        key={`page${i + 1}`}
                        onClick={() => setPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    )
                  ))}
                </>
              )}
            <Pagination.Next
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(page + 1)}
            />
            <Pagination.Last
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(totalPages)}
            />
          </Pagination>
        )}
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
