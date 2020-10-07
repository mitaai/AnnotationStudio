import {
  Card, Nav,
} from 'react-bootstrap';

const AdminPanel = () => (
  <Card>
    <Card.Header>
      <Card.Title>Administration</Card.Title>
      <Nav justify variant="tabs" defaultActiveKey="dashboard">
        <Nav.Item>
          <Nav.Link eventKey="dashboard" href="/admin">About</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="users">Users</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="documents">Documents</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="groups">Groups</Nav.Link>
        </Nav.Item>
      </Nav>
    </Card.Header>
    <Card.Body>
      <h6 className="text-center">Welcome to the Administration Panel.</h6>
      <h5>Responding to a GDPR data request?</h5>
      <ol>
        <li>Go to the Users tab.</li>
        <li>Look up the user by name or email address using the filter.</li>
        <li>
          Click on &ldquo;View&rdquo; in the rightmost table column (in the
          row for the requesting user).
        </li>
        <li>Click the link that says &ldquo;Click here to fetch annotations.&rdquo;</li>
        <li>
          Once annotations have loaded, print the page to PDF and send
          to the requesting user.
        </li>
        <li>If you are also responding to a deletion request, click &ldquo;Delete User&rdquo;.</li>
      </ol>
      <h5>Need to give someone access to the Administration Panel?</h5>
      <blockquote className="text-muted">
        Please be aware that giving someone admin access will allow them to view,
        edit, and delete all users, documents, and groups. These permissions should
        be granted only to trusted administrators.
      </blockquote>
      <ol>
        <li>Go to the Users tab.</li>
        <li>Look up the user by name or email address using the filter.</li>
        <li>
          Click on &ldquo;View&rdquo; in the rightmost table column (in the
          row for the requesting user).
        </li>
        <li>Click the &ldquo;Make Admin&rdquo; button.</li>
      </ol>
    </Card.Body>
  </Card>
);

export default AdminPanel;
