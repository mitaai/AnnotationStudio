import { useState, useEffect } from 'react';
import {
  Card, Tabs, Tab,
} from 'react-bootstrap';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../AdminUserList';
import AdminDocumentList from '../AdminDocumentList';
import AdminGroupList from '../AdminGroupList';
import { adminGetGroups } from '../../../utils/adminUtil';

const AdminPanel = ({ alerts, setAlerts, session }) => {
  const [key, setKey] = useState('dashboard');
  const [listLoading, setListLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (session) {
        if (key === 'groups') {
          const params = '?page=0&perPage=10';
          setData(
            await adminGetGroups(params)
              .then(setListLoading(false))
              .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }])),
          );
        }
      }
    }
    fetchData();
  }, [key]);

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
        {key === 'users' && (<AdminUserList users={data} loading={listLoading} />)}
        {key === 'documents' && (<AdminDocumentList documents={data} loading={listLoading} />)}
        {key === 'groups' && (<AdminGroupList groups={data} loading={listLoading} />)}
      </Card.Body>
    </Card>
  );
};

export default AdminPanel;
