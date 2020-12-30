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

  const contributorTypes = ['Author', 'Editor', 'Translator', 'Contributor'];

  const [expandMeta, setExpandMeta] = useState(false);
  const [notesOn, setNotesOn] = useState(false);

  return (
    <>
      <Row>
        <Col>
          <Form.Group controlId="documentContributors" data-testid="contributors-fields">
            <Form.Label>Contributor(s)</Form.Label>
            <FieldArray
              name="contributors"
              render={(arrayHelpers) => (
                <>
                  {values.contributors && values.contributors.length > 0 && (
                    values.contributors.map((contributor, index) => (
                      <Row key={index}>
                        <Col>
                          <InputGroup className="mb-2">
                            <Form.Control
                              as="select"
                              name={`contributors.${index}.type`}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={contributor.type}
                            >
                              {contributorTypes.map(
                                ((type) => (
                                  <option key={type}>{type}</option>
                                )),
                              )}
                            </Form.Control>
                            <Form.Control
                              type="text"
                              name={`contributors.${index}.name`}
                              placeholder="Name"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={contributor.name}
                              maxLength={255}
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
                      onClick={() => arrayHelpers.push({ type: 'Author', name: '' })}
                    >
                      + Add a contributor
                    </Button>
                  </>
                </>
              )}
            />
            <Form.Control.Feedback type="invalid">
              {errors.contributors}
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
              maxLength={255}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      {expandMeta && (
        <>
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
                  maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
                    maxLength={255}
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
                    maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
                  maxLength={255}
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
      )}
      <Row className="text-center">
        <Col>
          <Button
            onClick={() => setExpandMeta(!expandMeta)}
            variant="link"
            size="sm"
          >
            {expandMeta ? '- Hide ' : '+ Show '}
            additional metadata
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default DocumentMetadata;
