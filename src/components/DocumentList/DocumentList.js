/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Badge, Button, ButtonGroup, Table,
} from 'react-bootstrap';
import {
  ArchiveFill,
  ChatLeftTextFill,
  Globe,
  PencilFill,
  PencilSquare,
  TrashFill,
} from 'react-bootstrap-icons';
import { format } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import { getGroupNameById } from '../../utils/groupUtil';
import { deleteDocumentById } from '../../utils/docUtil';
import ConfirmationDialog from '../ConfirmationDialog';
import { ucFirst } from '../../utils/stringUtil';

const DocumentList = ({
  documents,
  setDocuments,
  loading,
  userId,
  alerts,
  setAlerts,
}) => {
  const [groupState, setGroupState] = useState({});
  const [showModal, setShowModal] = useState('');
  const handleCloseModal = () => setShowModal('');
  const handleShowModal = (event) => {
    setShowModal(event.target.getAttribute('data-key'));
  };

  const getStateIcon = (state) => {
    switch (state) {
      case 'draft': return <PencilFill alt="draft" />;
      case 'published': return <ChatLeftTextFill alt="published" />;
      case 'archived': return <ArchiveFill alt="archived" />;
      case 'public': return <Globe alt="public" />;
      default: return '';
    }
  };

  useEffect(() => {
    if (documents) {
      const fetchGroupState = async () => {
        documents.map((document) => document.groups.map(async (group) => {
          if (!groupState[group]) {
            setGroupState({ ...groupState, [group]: await getGroupNameById(group) });
          }
        }));
      };
      fetchGroupState();
    }
  }, [documents, groupState]);

  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && (
        <Table striped bordered data-testid="documents-table">
          <thead>
            <tr>
              <th>
                Title
              </th>
              <th>
                Authors
              </th>
              <th>
                Created
              </th>
              <th>
                Groups
              </th>
              <th>
                Status
              </th>
              <th>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              // eslint-disable-next-line no-underscore-dangle
              <tr key={document._id}>
                <td>
                  <Link href={`documents/${document.slug}`}>
                    {document.title}
                  </Link>
                </td>
                <td>
                  {document.authors ? document.authors.join(', ') : (<Badge>[no author]</Badge>)}
                </td>
                <td>
                  {format(new Date(document.createdAt), 'MM/dd/yyyy')}
                </td>
                <td>
                  {(document.groups && document.groups.length > 0)
                    ? document.groups.sort().map((group) => (
                      <Badge
                        variant="info"
                        className="mr-1"
                        as={Button}
                        href={`/groups/${group}`}
                        key={group}
                      >
                        {groupState[group]}
                      </Badge>
                    )) : (<Badge>[no groups]</Badge>)}
                </td>
                <td>
                  {getStateIcon(document.state)}
                  {document.state && (
                    <Badge>
                      {ucFirst(document.state)}
                    </Badge>
                  )}
                </td>
                <td>
                  {document.owner === userId && (
                    <ButtonGroup>
                      <Button variant="outline-primary" href={`documents/${document.slug}/edit`}>
                        <PencilSquare className="align-text-bottom mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        type="button"
                        onClick={(evt) => {
                          handleShowModal(evt);
                        }}
                        data-key={document._id}
                      >
                        <TrashFill className="align-text-bottom mr-1" />
                        Delete
                      </Button>
                      <ConfirmationDialog
                        name={document.title}
                        type="document"
                        handleCloseModal={handleCloseModal}
                        show={showModal === document._id}
                        onClick={(event) => {
                          event.target.setAttribute('disabled', 'true');
                          deleteDocumentById(document._id).then(() => {
                            setDocuments(documents.filter((d) => d._id !== document._id));
                            setAlerts([...alerts, {
                              text: 'You have successfully deleted the document.',
                              variant: 'warning',
                            }]);
                          }).catch((err) => {
                            setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
                          });
                          handleCloseModal();
                        }}
                      />
                    </ButtonGroup>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default DocumentList;
