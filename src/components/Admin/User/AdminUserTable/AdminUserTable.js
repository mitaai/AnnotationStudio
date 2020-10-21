import React, { useState } from 'react';
import {
  Badge, Button, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import AdminRoleBadge from '../../AdminRoleBadge';
import { getDocumentsByUser } from '../../../../utils/docUtil';

const AdminUserTable = ({ user }) => {
  const [docs, setDocs] = useState({});

  const fetchDocuments = async () => {
    if (user) {
      const { id } = user;
      setDocs({ found: await getDocumentsByUser(id) });
    }
  };

  return (
    <Table
      striped
      bordered
      hover
      size="sm"
      variant="light"
      style={{ borderCollapse: 'unset' }}
    >
      <thead>
        <tr>
          <td colSpan="2" className="text-center">View User</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th style={{ width: '25%' }}>First Name</th>
          <td>{user.firstName}</td>
        </tr>
        <tr>
          <th>Last Name</th>
          <td>{user.lastName}</td>
        </tr>
        <tr>
          <th>Email</th>
          <td>{user.email}</td>
        </tr>
        <tr>
          <th>Slug</th>
          <td>{user.slug}</td>
        </tr>
        <tr>
          <th>Affiliation</th>
          <td>{user.affiliation}</td>
        </tr>
        <tr>
          <th>Role</th>
          <td><AdminRoleBadge role={user.role} /></td>
        </tr>
        <tr>
          <th>Registered</th>
          <td>{format(new Date(user.createdAt), 'PPPppp')}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{format(new Date(user.updatedAt), 'PPPppp')}</td>
        </tr>
        <tr>
          <th>Last login</th>
          <td>{user.emailVerified && format(new Date(user.emailVerified), 'PPPppp')}</td>
        </tr>
        <tr>
          <th>Groups</th>
          <td>
            {(user.groups && user.groups.length > 0)
              ? user.groups.sort().map((group) => {
                let variant;
                switch (group.role) {
                  case 'member':
                    variant = 'secondary';
                    break;
                  case 'manager':
                    variant = 'warning';
                    break;
                  case 'owner':
                    variant = 'primary';
                    break;
                  default:
                    variant = 'secondary';
                    break;
                }
                return (
                  <Badge
                    variant={variant}
                    className="mr-1"
                    as={Button}
                    href={`/admin/group/${group.id}`}
                    key={group.id}
                  >
                    {group.name}
                  </Badge>
                );
              })
              : (<Badge>[no groups]</Badge>)}
          </td>
        </tr>
        <tr>
          <th>Documents</th>
          <td>
            {docs.found && docs.found.length > 0 && (
              docs.found.map((doc) => (
                <Button variant="link" size="sm" href={`/admin/document/${doc.slug}`}>{doc.title}</Button>
              ))
            )}
            {docs.found && docs.found.length === 0 && (
              <Button variant="text" size="sm" disabled>This user has not created any documents.</Button>
            )}
            {!docs.found && (
              <Button variant="link" size="sm" onClick={() => { fetchDocuments(); }}>Click to fetch</Button>
            )}
          </td>
        </tr>
        <tr>
          <th>Annotations</th>
          <td><Button variant="link" size="sm">Click to fetch</Button></td>
        </tr>
      </tbody>
    </Table>
  );
};

export default AdminUserTable;
