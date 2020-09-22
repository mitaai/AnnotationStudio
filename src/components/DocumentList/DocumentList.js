import {
  Card, Table,
} from 'react-bootstrap';

const DocumentList = ({
  documents,
}) => (
  <Card>
    <Card.Body>
      <Table>
        {documents.map((document) => (
          <>{JSON.stringify(document)}</>
        ))}
      </Table>
    </Card.Body>
  </Card>
);

export default DocumentList;
