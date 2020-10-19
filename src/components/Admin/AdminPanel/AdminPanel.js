/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import {
  Card, Pagination, Tabs, Tab,
} from 'react-bootstrap';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../AdminUserList';
import AdminDocumentList from '../AdminDocumentList';
import AdminGroupList from '../AdminGroupList';
import { adminGetList } from '../../../utils/adminUtil';

const AdminPanel = ({ alerts, setAlerts, session }) => {
  const [key, setKey] = useState('dashboard');
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
        if (key !== 'dashboard') {
          const params = `?page=${page}&perPage=${perPage}`;
          await adminGetList(key, params)
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
  }, [key]);

  useEffect(() => {
    async function fetchData() {
      if (session) {
        setListLoading(true);
        setTotalPages(1);
        if (key !== 'dashboard') {
          const params = `?page=${page}&perPage=${perPage}`;
          await adminGetList(key, params)
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
      <Card.Header>
        <Card.Title>Administration</Card.Title>
        <Tabs
          justify
          activeKey={key}
          onSelect={(k) => setKey(k)}
        >
          <Tab eventKey="dashboard" title="About" />
          <Tab eventKey="users" title="Users" />
          <Tab eventKey="documents" title="Documents" />
          <Tab eventKey="groups" title="Groups" />
        </Tabs>
      </Card.Header>
      <Card.Body>
        {key === 'dashboard' && (<AdminDashboard />)}
        {key !== 'dashboard' && (
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
        {key === 'users' && (
          <AdminUserList
            users={data.users}
            loading={listLoading}
          />
        )}
        {key === 'documents' && (
        <AdminDocumentList
          documents={data.documents}
          loading={listLoading}
        />
        )}
        {key === 'groups' && (
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
