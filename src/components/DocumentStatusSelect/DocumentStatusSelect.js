import { Field, ErrorMessage } from 'formik';
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
  onChange,
  onBlur,
  session,
  disableDraft,
  disabled,
}) => (
  <Row className="mt-3">
    <Col>
      <Form.Group data-testid="status-select-form">
        <Form.Check
          name="state"
          id="draft"
          disabled={disabled}
        >
          <FormCheck.Input
            name="state"
            type="radio"
            value="draft"
            onChange={onChange}
            onBlur={onBlur}
            as={Field}
            disabled={disableDraft || disabled}
          />
          <FormCheck.Label>
            <PencilFill className="mb-1" />
            {' '}
            Draft
          </FormCheck.Label>
        </Form.Check>
        <Form.Check
          name="state"
          id="published"
          disabled={disabled}
        >
          <FormCheck.Input
            name="state"
            type="radio"
            value="published"
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            as={Field}
          />
          <FormCheck.Label>
            <ChatLeftTextFill className="mb-1" />
            {' '}
            Published
          </FormCheck.Label>
        </Form.Check>
        <Form.Check
          disabled={disabled}
          name="state"
          id="archived"
        >
          <FormCheck.Input
            name="state"
            type="radio"
            value="archived"
            onChange={onChange}
            onBlur={onBlur}
            as={Field}
            disabled={disabled}
          />
          <FormCheck.Label>
            <ArchiveFill className="mb-1" />
            {' '}
            Archived
          </FormCheck.Label>
        </Form.Check>
        {session.user && session.user.role === 'admin' && process.env.ALLOW_PUBLIC && (
          <Form.Check
            name="state"
            id="public"
            disabled={disabled}
          >
            <FormCheck.Input
              name="state"
              type="radio"
              value="public"
              onChange={onChange}
              onBlur={onBlur}
              as={Field}
              disabled={disabled}
            />
            <FormCheck.Label>
              <Globe className="mb-1" />
              {' '}
              Public
            </FormCheck.Label>
          </Form.Check>
        )}
        <ErrorMessage name="state" />
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
            <td>
              {(values.state === 'draft') ? (
                <>
                  <GreenCheck />
                  *
                </>
              ) : (<RedX />)}
            </td>
            <td>{(values.state === 'published') ? (<GreenCheck />) : (<RedX />)}</td>
          </tr>
          {!(values.groups.length === 1 && values.groups[0] === '') && (
            <tr>
              <td>
                <PeopleFill />
                {' '}
                Groups
              </td>
              <td>{(values.state === 'draft') ? (<RedX />) : (<GreenCheck />)}</td>
              <td><RedX /></td>
              <td>{(values.state === 'published') ? (<GreenCheck />) : (<RedX />)}</td>
            </tr>
          )}
          <tr>
            <td>
              <Globe />
              {' '}
              Public
            </td>
            <td>{(values.state === 'public') ? (<GreenCheck />) : (<RedX />)}</td>
            <td><RedX /></td>
            <td><RedX /></td>
          </tr>
        </tbody>
      </Table>
    </Col>
  </Row>
);

export default DocumentStatusSelect;
