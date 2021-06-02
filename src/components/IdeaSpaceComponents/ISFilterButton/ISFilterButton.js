import React, { useContext } from 'react';
import {
  OverlayTrigger, Button, Popover, Accordion, AccordionContext, Card, useAccordionToggle, Form,
} from 'react-bootstrap';
import {
  BookmarkFill,
  CalendarEventFill,
  ChatRightQuoteFill, FileEarmarkFill, Filter, PeopleFill, ShieldLockFill,
} from 'react-bootstrap-icons';
import styles from './ISFilterButton.module.scss';

const ContextAwareToggle = ({
  children, disabled, eventKey, callback,
}) => {
  const currentEventKey = useContext(AccordionContext);

  const decoratedOnClick = useAccordionToggle(
    eventKey,
    () => callback && callback(eventKey),
  );

  const isCurrentEventKey = currentEventKey === eventKey;

  return (
    <Button
      className={`${styles.filterHeader} ${isCurrentEventKey ? styles.selected : ''}`}
      type="button"
      variant="text"
      onClick={decoratedOnClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

/*
const filterIcons = {
  byPermissions: <ShieldLockFill size={14} style={{ marginRight: 4 }} />,
  annotatedBy: <ChatRightQuoteFill size={14} style={{ marginRight: 4 }} />,
  byGroup: <PeopleFill size={14} style={{ marginRight: 4 }} />,
  byDocument: <FileEarmarkFill size={14} style={{ marginRight: 4 }} />,
  byTag: <BookmarkFill size={14} style={{ marginRight: 4 }} />,
  byDateCreated: <CalendarEventFill size={14} style={{ marginRight: 4 }} />,
};
*/
export default function ISFilterButton({
  active,
}) {
  return (
    <>
      <OverlayTrigger
        trigger="click"
        key="filter-popover"
        placement="bottom"
        rootClose
        overlay={(
          <Popover key="is-filter-popover" id="is-filter-popover">
            <Popover.Title as="h3">45 / 100 results</Popover.Title>
            <Popover.Content>
              <Accordion>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byPermissions">
                      <ShieldLockFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Permissions</span>
                      <span className={styles.appliedText}>1 Applied</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byPermissions">
                    <Card.Body>
                      <FilterRow text="Shared With Group(s)" checked number={5} />
                      <FilterRow text="Private" checked number={5} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="annotatedBy">
                      <ChatRightQuoteFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>Annotated By</span>
                      <span className={styles.appliedText}>1 Applied</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="annotatedBy">
                    <Card.Body>
                      hello
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byGroup">
                      <PeopleFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Group</span>
                      <span className={styles.appliedText}>1 Applied</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byGroup">
                    <Card.Body>
                      hello
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byDocument">
                      <FileEarmarkFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Document</span>
                      <span className={styles.appliedText}>1 Applied</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byDocument">
                    <Card.Body>
                      <FilterRow text="alpha" checked number={5} />
                      <FilterRow text="beta" checked number={5} />
                      <FilterRow text="gamma" checked number={5} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byTag">
                      <BookmarkFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Tag</span>
                      <span className={styles.appliedText}>1 Applied</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byTag">
                    <Card.Body>
                      <FilterRow text="alpha" checked number={5} />
                      <FilterRow text="beta" checked number={5} />
                      <FilterRow text="gamma" checked number={5} />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byDateCreated">
                      <CalendarEventFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Date Created</span>
                      <span className={styles.appliedText}>1 Applied</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byDateCreated">
                    <Card.Body>
                      hello
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </Popover.Content>
          </Popover>
)}
      >
        <Button
          id="btn-filter-annotation-well"
          size="sm"
          variant={active ? 'primary' : 'secondary'}
        >
          <div>
            <Filter size="1em" />
            <span style={{ marginLeft: 2 }}>Filter</span>
          </div>
        </Button>
      </OverlayTrigger>
      <style jsx global>
        {`
          #is-filter-popover .arrow::after {
            border-bottom-color: #f7f7f7 !important;
          }

          #is-filter-popover .accordion > .card {
            border-left: none !important;
            border-right: none !important;
            border-bottom: none !important;
          }

          #is-filter-popover .accordion > .card:first-child {
            border-top: none !important;
          }

          #is-filter-popover .popover-body {
            padding: 0px;
          }

          #is-filter-popover .card-header {
            background: white;
            padding: 0px !important;
          }

          #is-filter-popover {
            min-width: 500px !important;
          }

          #is-filter-popover .btn {
            border: none !important;
            outline: none;
            box-shadow: none;
          }

        `}
      </style>
    </>
  );
}

function FilterRow({
  checked, text = '', number = 0, toggle = () => {},
}) {
  return (
    <div className={styles.filterRowContainer}>
      <Form.Check
        type="checkbox"
        className={styles.filterRowCheckbox}
        onClick={toggle}
      >
        <Form.Check.Input type="checkbox" checked={checked} disabled={number === 0} />
        <Form.Check.Label>{text}</Form.Check.Label>
      </Form.Check>
      <span className={styles.filterRowNumber}>{number}</span>
    </div>
  );
}
