/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import { useState } from 'react';
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
import { deleteDocumentById } from '../../utils/docUtil';
import ConfirmationDialog from '../ConfirmationDialog';
import { upperCaseFirstLetter } from '../../utils/stringUtil';
import TileBadge from '../TileBadge';

const DocumentList = ({
  selectedGroupId,
  documents,
  setDocuments,
  loading,
  setLoading,
  userId,
  setAlerts,
}) => {
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
                    {(document.groups && document.groups.length > 0)
                      ? document.groups.map((group) => (
                        <TileBadge
                          key={group._id}
                          color={selectedGroupId === group._id ? 'blue' : 'grey'}
                          marginRight={5}
                          text={group.name}
                        />
                      )) : (<Badge>[no groups]</Badge>)}
                  </td>
                  <td>
                    {getStateIcon(document.state)}
                    {document.state && (
                    <Badge className="d-sm-none d-xl-inline">
                      {upperCaseFirstLetter(document.state)}
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
                            setAlerts((prevState) => [...prevState, {
                              text: 'You have successfully deleted the document.',
                              variant: 'warning',
                            }]);
                            setLoading(false);
                          }).catch((err) => {
                            setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
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
