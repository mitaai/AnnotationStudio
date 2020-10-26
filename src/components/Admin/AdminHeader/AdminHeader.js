import {
  Card, Tabs, Tab,
} from 'react-bootstrap';

const AdminHeader = ({ activeKey, setKey }) => (
  <Card.Header>
    <Card.Title>Administration</Card.Title>
    <Tabs
      justify
      activeKey={activeKey}
      onSelect={(k) => setKey(k)}
    >
      <Tab eventKey="dashboard" title="About" />
      <Tab eventKey="users" title="Users" />
      <Tab eventKey="documents" title="Documents" />
      <Tab eventKey="groups" title="Groups" />
    </Tabs>
  </Card.Header>
);

export default AdminHeader;
