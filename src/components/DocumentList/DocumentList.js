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
import { getGroupNameById, filterGroupIdsByUser } from '../../utils/groupUtil';
import { deleteDocumentById } from '../../utils/docUtil';
import ConfirmationDialog from '../ConfirmationDialog';
import { ucFirst } from '../../utils/stringUtil';

const DocumentList = ({
  documents,
  setDocuments,
  loading,
  setLoading,
  userId,
  alerts,
  setAlerts,
  userGroups,
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
            const name = await getGroupNameById(group)
              .catch((err) => {
                setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
              });
            setGroupState((prevState) => ({
              ...prevState,
              [group]: name,
            }));
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
        <Table striped bordered data-testid="documents-table" responsive="lg">
          <thead>
            <tr>
              <th>
                Title
              </th>
              <th>
                Contributors
              </th>
              <th>
                Created
              </th>
              <th>
                Groups
              </th>
              <th style={{ width: '11%' }}>
                Status
              </th>
              <th style={{ width: '18%' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {documents
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((document) => (
              // eslint-disable-next-line no-underscore-dangle
                <tr key={document._id}>
                  <td>
                    <Link href={`documents/${document.slug}`}>
                      {document.title}
                    </Link>
                  </td>
                  <td>
                    {document.contributors
                      ? document.contributors.map((c) => c.name).join(', ')
                      : (<Badge>[no contributors]</Badge>)}
                  </td>
                  <td>
                    {format(new Date(document.createdAt), 'MM/dd/yyyy')}
                  </td>
                  <td>
                    {(document.groups && document.groups.length > 0 && userGroups)
                      ? filterGroupIdsByUser(document.groups, userGroups).sort().map((group) => (
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
                    <Badge className="d-sm-none d-xl-inline">
                      {ucFirst(document.state)}
                    </Badge>
                    )}
                  </td>
                  <td className="text-center">
                    {document.owner === userId && (
                    <ButtonGroup>
                      <Button variant="outline-primary" href={`documents/${document.slug}/edit`}>
                        <PencilSquare className="align-text-bottom mr-1" />
                        <span className="d-sm-none d-xl-inline">Edit</span>
                      </Button>
                      <Button
                        variant="outline-danger"
                        type="button"
                        onClick={(evt) => {
                          handleShowModal(evt);
                        }}
                        data-key={document._id}
                      >
                        <TrashFill
                          className="align-text-bottom mr-1"
                          data-key={document._id}
                        />
                        <span
                          data-key={document._id}
                          className="d-sm-none d-xl-inline"
                        >
                          Delete
                        </span>
                      </Button>
                      <ConfirmationDialog
                        name={document.title}
                        type="document"
                        handleCloseModal={handleCloseModal}
                        show={showModal === document._id}
                        onClick={(event) => {
                          setLoading(true);
                          event.target.setAttribute('disabled', 'true');
                          deleteDocumentById(document._id).then(() => {
                            setDocuments(documents.filter((d) => d._id !== document._id));
                            setAlerts([...alerts, {
                              text: 'You have successfully deleted the document.',
                              variant: 'warning',
                            }]);
                            setLoading(false);
                          }).catch((err) => {
                            setAlerts([...alerts, { text: err.message, variant: 'danger' }]);
                            setLoading(false);
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
