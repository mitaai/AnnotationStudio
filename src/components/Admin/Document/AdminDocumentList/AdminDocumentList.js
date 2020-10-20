/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import LoadingSpinner from '../../../LoadingSpinner';
import { getUserById } from '../../../../utils/userUtil';

const AdminDocumentList = (props) => {
  const {
    documents, loading, alerts, setAlerts,
  } = props;
  const [namesState, setNamesState] = useState({});

  useEffect(() => {
    async function fetchData() {
      if (documents && Array.isArray(documents) && documents.length > 0) {
        documents.map(async (document) => {
          if (!namesState[document.owner]) {
            await getUserById(document.owner)
              .then((result) => {
                setNamesState({ ...namesState, [document.owner]: result.name });
              })
              .catch((err) => setAlerts([...alerts, { text: err.message, variant: 'danger' }]));
          }
        });
      }
    }
    fetchData();
  }, [documents, namesState]);
  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && documents && (
        <Table
          striped
          bordered
          hover
          size="sm"
          variant="light"
          style={{ borderCollapse: 'unset' }}
          data-testid="admin-docs-table"
        >
          <thead>
            <tr>
              <th>Title</th>
              <th>Owner</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr key={document._id}>
                <td style={{ width: '40%' }}>
                  {document.title}
                </td>
                <td style={{ width: '25%' }}>
                  {namesState[document.owner] || 'Loading...'}
                </td>
                <td style={{ width: '25%' }}>
                  {format(new Date(document.createdAt), 'MM/dd/yyyy')}
                </td>
                <td style={{ width: '10%' }}>
                  <Link href={`/admin/document/${document.slug}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default AdminDocumentList;
