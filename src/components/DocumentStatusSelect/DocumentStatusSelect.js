import { Field } from 'formik';
import {
  ArchiveFill,
  ChatLeftTextFill,
  Check,
  EyeFill,
  Globe,
  PencilFill,
  PencilSquare,
  PeopleFill,
  PersonFill,
  X,
} from 'react-bootstrap-icons';
import {
  Col, Form, FormCheck, Row, Table,
} from 'react-bootstrap';

const GreenCheck = () => <Check style={{ color: 'green', fontSize: '1.5rem' }} />;
const RedX = () => <X style={{ color: 'red', fontSize: '1.5rem' }} />;

const DocumentStatusSelect = ({
  values,
}) => (
  <Row>
    <Col>
      <Form.Group>
        <Form.Check
          name="status"
          id="draft"
        >
          <FormCheck.Input
            name="status"
            type="radio"
            value="draft"
            as={Field}
          />
          <FormCheck.Label>
            <PencilFill className="mb-1" />
            {' '}
            Draft
          </FormCheck.Label>
        </Form.Check>
        <Form.Check
          name="status"
          id="published"
        >
          <FormCheck.Input
            name="status"
            type="radio"
            value="published"
            as={Field}
          />
          <FormCheck.Label>
            <ChatLeftTextFill className="mb-1" />
            {' '}
            Published
          </FormCheck.Label>
        </Form.Check>
        <Form.Check
          name="status"
          id="archived"
        >
          <FormCheck.Input
            name="status"
            type="radio"
            value="archived"
            as={Field}
          />
          <FormCheck.Label>
            <ArchiveFill className="mb-1" />
            {' '}
            Archived
          </FormCheck.Label>
        </Form.Check>
        <Form.Check
          name="status"
          id="public"
        >
          <FormCheck.Input
            name="status"
            type="radio"
            value="public"
            as={Field}
          />
          <FormCheck.Label>
            <Globe className="mb-1" />
            {' '}
            Public
          </FormCheck.Label>
        </Form.Check>
      </Form.Group>
    </Col>
    <Col xs="auto">
      <Table
        size="sm"
        bordered
        className="text-center"
        role="table"
      >
        <thead>
          <tr>
            <th>
              {' '}
            </th>
            <th>
              <EyeFill />
              {' '}
              View
            </th>
            <th>
              <PencilSquare />
              {' '}
              Edit
            </th>
            <th>
              <ChatLeftTextFill />
              {' '}
              Annotate
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <PersonFill />
              {' '}
              Me
            </td>
            <td><GreenCheck /></td>
            <td>{(values.status === 'draft') ? (<GreenCheck />) : (<RedX />)}</td>
            <td>{(values.status === 'published') ? (<GreenCheck />) : (<RedX />)}</td>
          </tr>
          {!(values.groups.length === 1 && values.groups[0] === '') && (
            <tr>
              <td>
                <PeopleFill />
                {' '}
                Groups
              </td>
              <td>{(values.status === 'draft') ? (<RedX />) : (<GreenCheck />)}</td>
              <td><RedX /></td>
              <td>{(values.status === 'published') ? (<GreenCheck />) : (<RedX />)}</td>
            </tr>
          )}
          <tr>
            <td>
              <Globe />
              {' '}
              Public
            </td>
            <td>{(values.status === 'public') ? (<GreenCheck />) : (<RedX />)}</td>
            <td><RedX /></td>
            <td><RedX /></td>
          </tr>
        </tbody>
      </Table>
    </Col>
  </Row>
);

export default DocumentStatusSelect;
