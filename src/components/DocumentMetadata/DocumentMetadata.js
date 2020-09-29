/* eslint-disable react/no-array-index-key */
import { useState } from 'react';
import { FieldArray } from 'formik';
import {
  Button, Col, Form, InputGroup, Row,
} from 'react-bootstrap';

const DocumentMetadata = ({
  resourceType,
  values,
  handleChange,
  handleBlur,
  errors,
  touched,
}) => {
  const publicationFieldName = (type) => {
    switch (type) {
      case 'Book Section': return 'Book title';
      case 'Journal Article': return 'Journal title';
      case 'Newspaper Article': return 'Newspaper title';
      case 'Magazine Article': return 'Magazine title';
      case 'Web Page': return 'Website title';
      default: return 'Publication title';
    }
  };
  const [notesOn, setNotesOn] = useState(false);

  return (
    <>
      <Row>
        <Col>
          <Form.Group controlId="documentAuthors">
            <Form.Label>Author(s)</Form.Label>
            <FieldArray
              name="authors"
              render={(arrayHelpers) => (
                <>
                  {values.authors && values.authors.length > 0 && (
                    values.authors.map((author, index) => (
                      <Row key={index}>
                        <Col>
                          <InputGroup className="mb-2">
                            <Form.Control
                              type="text"
                              name={`authors.${index}`}
                              placeholder="Author"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={author}
                            />
                            <InputGroup.Append>
                              <Button
                                type="button"
                                className="rounded-right"
                                variant="outline-primary"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                ✕
                              </Button>
                            </InputGroup.Append>
                          </InputGroup>
                        </Col>
                      </Row>
                    ))
                  )}
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      onClick={() => arrayHelpers.push('')}
                    >
                      + Add an author
                    </Button>
                  </>
                </>
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.authors}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="documentEditors">
            <Form.Label>Editor(s)</Form.Label>
            <FieldArray
              name="editors"
              render={(arrayHelpers) => (
                <>
                  {values.editors && values.editors.length > 0 && (
                    values.editors.map((editor, index) => (
                      <Row key={index}>
                        <Col>
                          <InputGroup className="mb-2">
                            <Form.Control
                              type="text"
                              name={`editors.${index}`}
                              placeholder="Editor"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={editor}
                            />
                            <InputGroup.Append>
                              <Button
                                type="button"
                                className="rounded-right"
                                variant="outline-primary"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                ✕
                              </Button>
                            </InputGroup.Append>
                          </InputGroup>
                        </Col>
                      </Row>
                    ))
                  )}
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="link"
                      onClick={() => arrayHelpers.push('')}
                    >
                      + Add an editor
                    </Button>
                  </>
                </>
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.editors}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          <Form.Group controlId="documentTitle">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              placeholder="Title"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.title}
              isValid={touched.title && !errors.title}
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      {resourceType !== 'Book' && (
        <Row>
          <Col>
            <Form.Group controlId="documentPublication">
              <Form.Label>
                {publicationFieldName(resourceType)}
              </Form.Label>
              <Form.Control
                type="text"
                name="publication"
                placeholder={publicationFieldName(resourceType)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.publication}
                isValid={touched.publication && !errors.publication}
                isInvalid={!!errors.publication}
              />
              <Form.Control.Feedback type="invalid">
                {errors.publication}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Form.Group controlId="documentPublicationDate">
            <Form.Label>Publication date</Form.Label>
            <Form.Control
              type="text"
              name="publicationDate"
              placeholder="Date"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.publicationDate}
              isValid={touched.publicationDate
                && !errors.publicationDate}
              isInvalid={!!errors.publicationDate}
            />
            <Form.Control.Feedback type="invalid">
              {errors.publicationDate}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="documentPublisher">
            <Form.Label>Publisher</Form.Label>
            <Form.Control
              type="text"
              name="publisher"
              placeholder="Publisher"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.publisher}
              isValid={touched.publisher && !errors.publisher}
              isInvalid={!!errors.publisher}
            />
            <Form.Control.Feedback type="invalid">
              {errors.publisher}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        {(resourceType !== 'Web Page') && (
          <Col>
            <Form.Group controlId="documentLocation">
              <Form.Label>Publication location</Form.Label>
              <Form.Control
                type="text"
                name="location"
                placeholder="Location"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.location}
                isValid={touched.location && !errors.location}
                isInvalid={!!errors.location}
              />
              <Form.Control.Feedback type="invalid">
                {errors.location}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        )}
        <Col>
          <Form.Group controlId="documentRightsStatus">
            <Form.Label>Rights status</Form.Label>
            <Form.Control
              as="select"
              name="rightsStatus"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.rightsStatus}
            >
              <option>Copyrighted</option>
              <option>Creative Commons</option>
              <option>Public Domain</option>
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              {errors.rightsStatus}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      { ['Book', 'Book Section', 'Journal Article', 'Magazine Article'].includes(resourceType) && (
        <Row>
          <Col>
            <Form.Group controlId="documentVolume">
              <Form.Label>Volume</Form.Label>
              <Form.Control
                type="text"
                name="volume"
                placeholder="Volume"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.volume}
                isValid={touched.volume && !errors.volume}
                isInvalid={!!errors.volume}
              />
              <Form.Control.Feedback type="invalid">
                {errors.volume}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          {['Journal Article', 'Magazine Article'].includes(resourceType) && (
            <Col>
              <Form.Group controlId="documentIssue">
                <Form.Label>Issue</Form.Label>
                <Form.Control
                  type="text"
                  name="issue"
                  placeholder="Issue"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.issue}
                  isValid={touched.issue && !errors.issue}
                  isInvalid={!!errors.issue}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.issue}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          )}
          {['Book', 'Book Section'].includes(resourceType) && (
            <Col>
              <Form.Group controlId="documentEdition">
                <Form.Label>Edition</Form.Label>
                <Form.Control
                  type="text"
                  name="edition"
                  placeholder="Edition"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.edition}
                  isValid={touched.edition && !errors.edition}
                  isInvalid={!!errors.edition}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.edition}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          )}
        </Row>
      )}
      {!['Book', 'Web Page'].includes(resourceType) && (
        <Row>
          <Col>
            <Form.Group controlId="documentPageNumbers">
              <Form.Label>Pages</Form.Label>
              <Form.Control
                type="text"
                name="pageNumbers"
                placeholder="Pages (e.g. 1-10)"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.pageNumbers}
                isValid={touched.pageNumbers && !errors.pageNumbers}
                isInvalid={!!errors.pageNumbers}
              />
              <Form.Control.Feedback type="invalid">
                {errors.pageNumbers}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}
      {['Book', 'Book Section'].includes(resourceType) && (
        <Row>
          <Col>
            <Form.Group controlId="documentSeries">
              <Form.Label>Series</Form.Label>
              <Form.Control
                type="text"
                name="series"
                placeholder="Series"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.series}
                isValid={touched.series && !errors.series}
                isInvalid={!!errors.series}
              />
              <Form.Control.Feedback type="invalid">
                {errors.series}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="documentSeriesNumber">
              <Form.Label>Number in series</Form.Label>
              <Form.Control
                type="text"
                name="seriesNumber"
                placeholder="Number"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.seriesNumber}
                isValid={touched.seriesNumber && !errors.seriesNumber}
                isInvalid={!!errors.seriesNumber}
              />
              <Form.Control.Feedback type="invalid">
                {errors.seriesNumber}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Form.Group controlId="documentUrl">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="text"
              name="url"
              placeholder="URL"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.url}
              isValid={touched.url && !errors.url}
              isInvalid={!!errors.url}
            />
            <Form.Control.Feedback type="invalid">
              {errors.url}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="documentAccessed">
            <Form.Label>Date accessed</Form.Label>
            <Form.Control
              type="text"
              name="accessed"
              placeholder="Accessed"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.accessed}
              isValid={touched.accessed && !errors.accessed}
              isInvalid={!!errors.accessed}
            />
            <Form.Control.Feedback type="invalid">
              {errors.accessed}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <Row>
        <Col>
          {!notesOn && (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setNotesOn(true)}
            >
              + Notes
            </Button>
          )}
          {notesOn && (
            <Form.Group controlId="documentNotes">
              <Form.Label>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="mb-1"
                  onClick={() => setNotesOn(false)}
                >
                  - Notes
                </Button>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="notes"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.notes}
                isValid={touched.notes && !errors.notes}
                isInvalid={!!errors.notes}
              />
              <Form.Control.Feedback type="invalid">
                {errors.notes}
              </Form.Control.Feedback>
            </Form.Group>
          )}
        </Col>
      </Row>
    </>
  );
};

export default DocumentMetadata;