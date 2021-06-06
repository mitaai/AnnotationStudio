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

export default function ISFilterButton({
  active,
  total = 0,
  result = 0,
  toggleFilters = () => {},
  filters = {
    byPermissions: {
      private: false,
      privateNumber: 0,
      shared: false,
      sharedNumber: 0,
    },
    annotatedBy: {},
    byGroup: {},
    byDocument: {},
    byTag: {},
    byDateCreated: { start: undefined, end: undefined },
  },
  onClick = () => {},
}) {
  const filterToFilterRows = (type) => {
    const filterRows = [];
    const keys = Object.keys(filters[type]);
    let numberApplied = 0;
    keys.map((key) => {
      const { name, number, checked } = filters[type][key];
      numberApplied += checked ? 1 : 0;
      filterRows.push({
        elmnt: <FilterRow
          key={key}
          text={name}
          number={number}
          checked={checked}
          toggle={() => {
            toggleFilters(type, key);
          }}
        />,
        name,
      });
      return null;
    });

    return {
      filterRows: filterRows.sort((a, b) => {
        if (a.name.toUpperCase() < b.name.toUpperCase()) {
          return -1;
        }
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }

        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }

        return 0;
      }).map(({ elmnt }) => elmnt),
      numberApplied,
    };
  };

  const annotatedByFilters = filterToFilterRows('annotatedBy');
  const byGroupFilters = filterToFilterRows('byGroup');
  const byDocumentFilters = filterToFilterRows('byDocument');
  const byTagFilters = filterToFilterRows('byTag');

  return (
    <>
      <OverlayTrigger
        trigger="click"
        key="filter-popover"
        placement="bottom"
        onEnter={onClick}
        rootClose
        overlay={(
          <Popover key="is-filter-popover" id="is-filter-popover">
            <Popover.Title as="h3">{`${result} results out of ${total}`}</Popover.Title>
            <Popover.Content>
              <Accordion>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byPermissions">
                      <ShieldLockFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Permissions</span>
                      <span className={styles.appliedText}>{`${!filters.byPermissions.private && !filters.byPermissions.shared ? 0 : 1} Applied`}</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byPermissions">
                    <Card.Body className={styles.filterRowsContainer}>
                      <FilterRow
                        text="Private"
                        checked={filters.byPermissions.private}
                        number={filters.byPermissions.privateNumber}
                        toggle={() => {
                          toggleFilters('byPermissions', 'private');
                        }}
                      />
                      <FilterRow
                        text="Shared With Group(s)"
                        checked={filters.byPermissions.shared}
                        number={filters.byPermissions.sharedNumber}
                        toggle={() => {
                          toggleFilters('byPermissions', 'shared');
                        }}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="annotatedBy">
                      <ChatRightQuoteFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>Annotated By</span>
                      <span className={styles.appliedText}>{`${annotatedByFilters.numberApplied} Applied`}</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="annotatedBy">
                    <Card.Body className={styles.filterRowsContainer}>
                      {annotatedByFilters.filterRows}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byGroup">
                      <PeopleFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Group</span>
                      <span className={styles.appliedText}>{`${byGroupFilters.numberApplied} Applied`}</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byGroup">
                    <Card.Body className={styles.filterRowsContainer}>
                      {byGroupFilters.filterRows}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byDocument">
                      <FileEarmarkFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Document</span>
                      <span className={styles.appliedText}>{`${byDocumentFilters.numberApplied} Applied`}</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byDocument">
                    <Card.Body className={styles.filterRowsContainer}>
                      {byDocumentFilters.filterRows}
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byTag">
                      <BookmarkFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Tag</span>
                      <span className={styles.appliedText}>{`${byTagFilters.numberApplied} Applied`}</span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byTag">
                    <Card.Body className={styles.filterRowsContainer}>
                      {byTagFilters.filterRows}
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
                    <Card.Body className={styles.filterRowsContainer}>
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
    <div
      className={styles.filterRowContainer}
      onClick={toggle}
      tabIndex={-1}
      onKeyDown={() => {}}
      role="button"
    >
      <Form.Check
        type="checkbox"
        className={styles.filterRowCheckbox}
      >
        <Form.Check.Input type="checkbox" checked={checked} disabled={number === 0} />
        <Form.Check.Label style={{ cursor: 'pointer' }}>{text}</Form.Check.Label>
      </Form.Check>
      <span
        className={styles.filterRowNumber}
        style={{ color: number === 0 ? '#6c757d' : '#424242' }}
      >
        {number}
      </span>
    </div>
  );
}
