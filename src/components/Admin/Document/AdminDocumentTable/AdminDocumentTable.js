import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Badge, Button, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import { getGroupNameById } from '../../../../utils/groupUtil';
import { getUserById } from '../../../../utils/userUtil';

const AdminDocumentTable = ({ document, alerts, setAlerts }) => {
  const [groupState, setGroupState] = useState({});
  const [namesState, setNamesState] = useState({});

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
      const fetchOwnerName = async () => {
        getUserById(document.owner)
          .then((result) => setNamesState({ ...namesState, [document.owner]: result.name }))
          .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]));
      };
      if (document.owner && !namesState[document.owner]) {
        fetchOwnerName();
      }
    }
  }, [document, namesState]);

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
            <td>{document.authors.join(', ')}</td>
          </tr>
        )}
        {document.editors && (
          <tr>
            <th>Editors</th>
            <td>{document.editors.join(', ')}</td>
          </tr>
        )}
        {document.publication && (
          <tr>
            <th>Publication</th>
            <td>{document.publication}</td>
          </tr>
        )}
        {document.bookTitle && (
          <tr>
            <th>Book Title</th>
            <td>{document.bookTitle}</td>
          </tr>
        )}
        {document.edition && (
          <tr>
            <th>Edition</th>
            <td>{document.edition}</td>
          </tr>
        )}
        {document.series && (
          <tr>
            <th>Series</th>
            <td>{document.series}</td>
          </tr>
        )}
        {document.seriesNumber && (
          <tr>
            <th>Series Number</th>
            <td>{document.seriesNumber}</td>
          </tr>
        )}
        {document.volume && (
          <tr>
            <th>Volume</th>
            <td>{document.volume}</td>
          </tr>
        )}
        {document.issue && (
          <tr>
            <th>Issue</th>
            <td>{document.issue}</td>
          </tr>
        )}
        {document.pageNumbers && (
          <tr>
            <th>Page Numbers</th>
            <td>{document.pageNumbers}</td>
          </tr>
        )}
        {document.publisher && (
          <tr>
            <th>Publisher</th>
            <td>{document.publisher}</td>
          </tr>
        )}
        {document.location && (
          <tr>
            <th>Location</th>
            <td>{document.location}</td>
          </tr>
        )}
        {document.publicationDate && (
          <tr>
            <th>Publication Date</th>
            <td>{document.publicationDate}</td>
          </tr>
        )}
        {document.url && (
          <tr>
            <th>URL</th>
            <td>{document.url}</td>
          </tr>
        )}
        {document.accessed && (
          <tr>
            <th>Accessed</th>
            <td>{document.accessed}</td>
          </tr>
        )}
        <tr>
          <th>Rights Status</th>
          <td>{document.rightsStatus}</td>
        </tr>
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
          <th>Owner</th>
          <td>
            {namesState[document.owner] && (
            <Link href={`/admin/user/${document.owner}`}>
              {namesState[document.owner].toString()}
            </Link>
            )}
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
