/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import { getUserById } from '../../../../utils/userUtil';
import SortableHeader from '../../SortableHeader';

const AdminDocumentList = (props) => {
  const {
    documents,
    sortState,
    setSortState,
    SortIcon,
  } = props;
  const [namesState, setNamesState] = useState({});

  useEffect(() => {
    async function fetchData() {
      if (documents && Array.isArray(documents) && documents.length > 0) {
        documents.map(async (document) => {
          if (!namesState[document.owner]) {
            await getUserById(document.owner)
              .then((result) => setNamesState((prevState) => ({
                ...prevState,
                [document.owner]: result.name,
              })))
              .catch(() => setNamesState((prevState) => ({
                ...prevState,
                [document.owner]: '[user not found]',
              })));
          }
        });
      }
    }
    fetchData();
  }, [documents, namesState]);
  return (
    <Table
      striped
      bordered
      hover
      size="sm"
      variant="light"
      style={{ borderCollapse: 'unset', display: 'flex', flexDirection: 'column' }}
      data-testid="admin-docs-table"
    >
      <thead>
        <tr style={{ display: 'flex' }}>
          <SortableHeader
            field="title"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 8 }}
          >
            Title
          </SortableHeader>
          <th style={{ flex: 5 }}>Owner</th>
          <SortableHeader
            field="createdAt"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 5 }}
          >
            Created
          </SortableHeader>
          <th style={{ flex: 2 }}>Actions</th>
        </tr>
      </thead>
      <tbody style={{ overflowY: 'overlay' }}>
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
              <Link href={`/admin/document/${document.slug}`}>View</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default AdminDocumentList;
