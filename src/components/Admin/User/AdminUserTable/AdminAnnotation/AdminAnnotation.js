/* eslint-disable no-underscore-dangle */
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Table,
} from 'react-bootstrap';

const AdminAnnotation = ({ annotation }) => (
  <div key={annotation._id} style={{ width: '70%' }}>
    <Table
      key={annotation._id}
      borderless
      size="sm"
      variant="light"
      style={{ border: '1px solid gray', borderCollapse: 'separate' }}
    >
      <tbody>
        <tr style={{ backgroundColor: 'white' }}>
          <th style={{ width: '20%' }}>Created</th>
          <td>{format(new Date(annotation.created), 'PPppp')}</td>
        </tr>
        <tr style={{ backgroundColor: 'white' }}>
          <th>Modified</th>
          <td>{format(new Date(annotation.modified), 'PPppp')}</td>
        </tr>
        <tr style={{ backgroundColor: 'white' }}>
          <th>Document</th>
          <td><Link href={`/admin/document/${annotation.target.document.slug}`}>{annotation.target.document.title}</Link></td>
        </tr>
        <tr style={{ backgroundColor: 'white' }}>
          <th>Quote</th>
          <td>{annotation.target.selector.exact}</td>
        </tr>
        <tr style={{ backgroundColor: 'white' }}>
          <th>Comment</th>
          <td>{annotation.body.value}</td>
        </tr>
        {annotation.body.tags && annotation.body.tags.length > 0 && (
          <tr style={{ backgroundColor: 'white' }}>
            <th>Tags</th>
            <td>{annotation.body.tags.join(', ')}</td>
          </tr>
        )}
      </tbody>
    </Table>
  </div>
);

export default AdminAnnotation;
