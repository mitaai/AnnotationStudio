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
import { GetGroupNameById } from '../../utils/groupUtil';
import { ucFirst } from '../../utils/stringUtil';

const DocumentList = ({
  documents,
  loading,
  userId,
}) => {
  const [groupState, setGroupState] = useState({});

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
            setGroupState({ ...groupState, [group]: await GetGroupNameById(group) });
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
        <Table striped bordered>
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
                  {document.authors.join(', ')}
                </td>
                <td>
                  {format(new Date(document.createdAt), 'MM/dd/yyyy')}
                </td>
                <td>
                  {document.groups.sort().map((group) => (
                    <Badge
                      variant="info"
                      className="mr-1"
                      as={Button}
                      href={`/groups/${group}`}
                    >
                      {groupState[group]}
                    </Badge>
                  ))}
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
                      <Button variant="outline-primary">
                        <PencilSquare className="align-text-bottom mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline-danger" alt="delete">
                        <TrashFill className="align-text-bottom mr-1" />
                      </Button>
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
