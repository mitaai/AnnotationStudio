import React, { useEffect, useState } from 'react';
import {
  Badge, Button, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import { getGroupNameById } from '../../../../utils/groupUtil';

const AdminDocumentTable = ({ document }) => {
  const [groupState, setGroupState] = useState({});

  useEffect(() => {
    if (document) {
      const fetchGroupState = async () => {
        document.groups.map(async (group) => {
          if (!groupState[group]) {
            setGroupState({ ...groupState, [group]: await getGroupNameById(group) });
          }
        });
      };
      fetchGroupState();
    }
  }, [document]);

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
          <td colSpan="2" className="text-center">Manage Document</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th style={{ width: '25%' }}>Slug</th>
          <td>{document.slug}</td>
        </tr>
        <tr>
          <th>Resource Type</th>
          <td>{document.resourceType}</td>
        </tr>
        <tr>
          <th>Title</th>
          <td>{document.title}</td>
        </tr>
        {document.authors && (
          <tr>
            <th>Authors</th>
            <td>{document.authors && document.authors.join(', ')}</td>
          </tr>
        )}
        {document.editors && (
          <tr>
            <th>Editors</th>
            <td>{document.editors.join(', ')}</td>
          </tr>
        )}
        <tr>
          <th>Created</th>
          <td>{format(new Date(document.createdAt), 'PPPppp')}</td>
        </tr>
        <tr>
          <th>Updated</th>
          <td>{format(new Date(document.updatedAt), 'PPPppp')}</td>
        </tr>
        <tr>
          <th>Groups</th>
          <td>
            {(document.groups && document.groups.length > 0)
              ? document.groups.sort().map((group) => (
                <Badge
                  variant="info"
                  className="mr-1"
                  as={Button}
                  href={`/admin/group/${group}`}
                  key={group}
                >
                  {groupState[group]}
                </Badge>
              ))
              : (<Badge>[no groups]</Badge>)}
          </td>
        </tr>
        <tr>
          <th>State</th>
          <td>{document.state}</td>
        </tr>
      </tbody>
    </Table>
  );
};

export default AdminDocumentTable;
