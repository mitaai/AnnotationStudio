/* eslint-disable no-underscore-dangle */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import { format } from 'date-fns';
import SortableHeader from '../../SortableHeader';
import LoadingSpinner from '../../../LoadingSpinner';

const AdminDocumentList = (props) => {
  const {
    documents,
    loading,
    namesState,
    sortState,
    setSortState,
    loadMoreResults,
    SortIcon,
  } = props;

  let content;
  let loadMoreResultsContent = null;
  if (loading) {
    content = <LoadingSpinner />;
  } else if (documents === undefined || documents.length === 0) {
    content = <div style={{ textAlign: 'center', color: '#616161', marginTop: 10 }}>
      {documents ? '0 Search Results' : 'No Search'}
    </div>;
  } else {
    loadMoreResultsContent = loadMoreResults ? <div
    onClick={loadMoreResults}
    style={{ textAlign: 'center', marginTop: 10, marginBottom: 10 }}>
      <span style={{ color: '#039be5', cursor: 'pointer' }}>Load More Results</span>
    </div> : null;
    content = documents.map((document) => (
      <Link key={document._id} href={`/admin/document/${document.slug}`}>
        <tr style={{ display: 'flex', cursor: 'pointer' }}>
          <td style={{ width: '50%' }}>
            {document.title}
          </td>
          <td style={{ width: '25%' }}>
            {namesState[document.owner] || 'Loading...'}
          </td>
          <td style={{ width: '25%' }}>
            {format(new Date(document.createdAt), 'MM/dd/yyyy')}
          </td>
        </tr>
      </Link>
    ));
  }
  
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
            style={{ flex: 2 }}
          >
            Title
          </SortableHeader>
          <th style={{ flex: 1 }}>Owner</th>
          <SortableHeader
            field="createdAt"
            sortState={sortState}
            setSortState={setSortState}
            SortIcon={SortIcon}
            style={{ flex: 1 }}
          >
            Created
          </SortableHeader>
        </tr>
      </thead>
      <tbody style={{ overflowY: 'overlay' }}>
        {content}
        {loadMoreResultsContent}
      </tbody>
    </Table>
  );
};

export default AdminDocumentList;
