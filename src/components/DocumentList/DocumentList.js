import {
  Card, Table,
} from 'react-bootstrap';
import LoadingSpinner from '../LoadingSpinner';

const DocumentList = ({
  documents,
  loading,
}) => (

  <Card>
    <Card.Body>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && (
        <Table>
          {documents.map((document) => (
            // eslint-disable-next-line no-underscore-dangle
            <tr key={document._id}>{JSON.stringify(document)}</tr>
          ))}
        </Table>
      )}
    </Card.Body>
  </Card>
);

export default DocumentList;
