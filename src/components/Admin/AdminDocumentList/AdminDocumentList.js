/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import {
  Table,
} from 'react-bootstrap';
import LoadingSpinner from '../../LoadingSpinner';

const AdminDocumentList = (props) => {
  const { documents, loading } = props;
  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && documents && (
        <Table striped bordered hover size="sm" variant="light" style={{ borderCollapse: 'unset' }}>
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
                  {document.owner}
                </td>
                <td style={{ width: '25%' }}>
                  {(new Date(document.createdAt)).toString()}
                </td>
                <td style={{ width: '10%' }}>
                  <Link href={`/admin/document/${document._id}`}>View</Link>
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
