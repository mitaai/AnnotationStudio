import { useState } from 'react';
import {
  Card, Tabs, Tab,
} from 'react-bootstrap';
import AdminDashboard from '../AdminDashboard';
import AdminUserList from '../AdminUserList';
import AdminDocumentList from '../AdminDocumentList';
import AdminGroupList from '../AdminGroupList';

const AdminPanel = () => {
  const [key, setKey] = useState('dashboard');
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
        {key === 'users' && (<AdminUserList />)}
        {key === 'documents' && (<AdminDocumentList />)}
        {key === 'groups' && (<AdminGroupList />)}
      </Card.Body>
    </Card>
  );
};

export default AdminPanel;
