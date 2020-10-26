/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import {
  Card, Pagination,
} from 'react-bootstrap';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../User/AdminUserList';
import AdminDocumentList from '../Document/AdminDocumentList';
import AdminGroupList from '../Group/AdminGroupList';
import AdminHeader from '../AdminHeader';
import { adminGetList } from '../../../utils/adminUtil';

const AdminPanel = ({
  alerts, setAlerts, session, activeKey, setKey,
}) => {
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [data, setData] = useState([]);
  const perPage = 20;

  useEffect(() => {
    async function fetchData() {
      if (session) {
        setListLoading(true);
        setPage(1);
        setTotalPages(1);
        if (activeKey !== 'dashboard') {
          const params = `?page=${page}&perPage=${perPage}`;
          await adminGetList(activeKey, params)
            .then((results) => {
              setTotalPages(Math.ceil((results.count) / perPage));
              setData(results);
              setListLoading(false);
            })
            .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]));
        }
      }
    }
    fetchData();
  }, [activeKey]);

  useEffect(() => {
    async function fetchData() {
      if (session) {
        setListLoading(true);
        setTotalPages(1);
        if (activeKey !== 'dashboard') {
          const params = `?page=${page}&perPage=${perPage}`;
          await adminGetList(activeKey, params)
            .then((results) => {
              setTotalPages(Math.ceil((results.count) / perPage));
              setData(results);
              setListLoading(false);
            })
            .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]));
        }
      }
    }
    fetchData();
  }, [page]);

  return (
    <Card>
      <AdminHeader activeKey={activeKey} setKey={setKey} />
      <Card.Body>
        {activeKey === 'dashboard' && (<AdminDashboard />)}
        {activeKey !== 'dashboard' && (
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
        {activeKey === 'users' && (
          <AdminUserList
            users={data.users}
            loading={listLoading}
          />
        )}
        {activeKey === 'documents' && (
        <AdminDocumentList
          documents={data.documents}
          loading={listLoading}
        />
        )}
        {activeKey === 'groups' && (
          <AdminGroupList
            groups={data.groups}
            loading={listLoading}
          />
        )}
      </Card.Body>
    </Card>
  );
};

export default AdminPanel;
