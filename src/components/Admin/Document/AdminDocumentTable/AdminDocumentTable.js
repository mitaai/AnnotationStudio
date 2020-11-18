import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import Link from 'next/link';
import {
  Badge, Button, Dropdown, DropdownButton, Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import { getGroupNameById } from '../../../../utils/groupUtil';
import { getUserById } from '../../../../utils/userUtil';
import { deleteDocumentById } from '../../../../utils/docUtil';
import ConfirmationDialog from '../../../ConfirmationDialog';

const AdminDocumentTable = ({ document, alerts, setAlerts }) => {
  const [groupState, setGroupState] = useState({});
  const [namesState, setNamesState] = useState({});

  const [showModal, setShowModal] = useState(false);
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

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
          .catch(() => setNamesState({ ...namesState, [document.owner]: '[user not found]' }));
      };
      if (document.owner && !namesState[document.owner]) {
        fetchOwnerName();
      }
    }
  }, [document, namesState]);

  return (
    <>
      <Table
        striped
        bordered
        hover
        size="sm"
        variant="light"
        style={{ borderCollapse: 'unset' }}
        data-testid="admin-doc-view"
      >
        <thead>
          <tr>
            <td colSpan="2" className="text-center">View Document</td>
            <td style={{ position: 'absolute', right: '2em', border: 'none' }} id="group-dropdown">
              <DropdownButton
                size="sm"
                variant="text"
                drop="down"
                title="Actions"
              >
                <Dropdown.Item eventKey="1" href={`/documents/${document.slug}`}>View full document</Dropdown.Item>
                <Dropdown.Item eventKey="2" href={`/documents/${document.slug}/edit`}>Modify document</Dropdown.Item>
                <Dropdown.Item eventKey="3" onClick={handleShowModal}>Delete document</Dropdown.Item>
              </DropdownButton>
            </td>
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
          {document.contributors && (
            <tr>
              <th>Contributors</th>
              <td>{document.contributors.map((c) => c.name).join(', ')}</td>
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
      <ConfirmationDialog
        name={document.title}
        type="document"
        handleCloseModal={handleCloseModal}
        show={showModal}
        onClick={(event) => {
          event.target.setAttribute('disabled', 'true');
          deleteDocumentById(document.id)
            .then(() => {
              Router.push({
                pathname: '/admin',
                query: {
                  alert: 'deletedDocument',
                  tab: 'documents',
                },
              });
            }).catch((err) => {
              setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
            });
          handleCloseModal();
        }}
      />
      <style jsx global>
        {`
          #document-dropdown .dropdown-menu {
            right: 0 !important;
            left: auto !important;
          }
        `}
      </style>
    </>
  );
};

export default AdminDocumentTable;
