import React, { useContext, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import { parseISO } from 'date-fns';
import {
  OverlayTrigger,
  Overlay,
  Tooltip,
  Button,
  Popover,
  Accordion,
  AccordionContext,
  Card,
  useAccordionToggle,
  Form,
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
  setByDateCreated,
  filters = {
    byPermissions: {
      mine: false,
      mineNumber: 0,
      sharedWithMe: false,
      sharedWithMeNumber: 0,
      private: false,
      privateNumber: 0,
      shared: false,
      sharedNumber: 0,
    },
    annotatedBy: {},
    byGroup: {},
    byDocument: {},
    byTag: {},
    byDateCreated: { start: undefined, end: undefined, checked: false },
  },
  onClick = () => {},
}) {
  const [calendarOpen, setCalendarOpen] = useState();
  const [tooltipShow, setTooltipShow] = useState();
  const [tooltipTarget, setTooltipTarget] = useState(null);
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
          toggle={() => toggleFilters(type, { key })}
        />,
        name,
      });
      return null;
    });

    return {
      filterRows: filterRows.sort((a, b) => {
        if (a?.name === undefined && b?.name === undefined) {
          return 0;
        }

        if (a?.name === undefined) {
          // if 'a' is undefined and 'b' is not undefined then 'b' automatically wins the sort
          return 1;
        }

        if (b?.name === undefined) {
          // if 'b' is undefined and 'a' is not undefined then 'a' automatically wins the sort
          return -1;
        }

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

  const popoverTitle = `${result} result${result === 1 ? '' : 's'} out of ${total}`;

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
            <Popover.Title as="h3">{popoverTitle}</Popover.Title>
            <Popover.Content>
              <Accordion>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byPermissions">
                      <ShieldLockFill size={18} style={{ marginRight: 4 }} />
                      <span className={styles.filterHeaderText}>By Permissions</span>
                      <span className={styles.appliedText}>
                        {`${filters.byPermissions.mine || filters.byPermissions.sharedWithMe || filters.byPermissions.private || filters.byPermissions.shared ? 1 : 0} Applied`}
                      </span>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byPermissions">
                    <Card.Body className={styles.filterRowsContainer}>
                      <FilterRow
                        text="Mine"
                        description="Annotations that are created by you"
                        checked={filters.byPermissions.mine || false}
                        type="radio"
                        number={filters.byPermissions.mineNumber}
                        toggle={() => toggleFilters('byPermissions', {
                          obj: filters.byPermissions.mine
                            ? {}
                            : { mine: true },
                        })}
                        tooltipShow={tooltipShow === 'mine'}
                        setTooltipShow={() => setTooltipShow('mine')}
                        tooltipTarget={tooltipTarget}
                        setTooltipTarget={setTooltipTarget}
                      />
                      <FilterRow
                        text="Shared with me"
                        description="Annotations that were specifically shared to you and not the group"
                        checked={filters.byPermissions.sharedWithMe || false}
                        type="radio"
                        number={filters.byPermissions.sharedWithMeNumber}
                        toggle={() => toggleFilters('byPermissions', {
                          obj: filters.byPermissions.sharedWithMe
                            ? {}
                            : { sharedWithMe: true },
                        })}
                        tooltipShow={tooltipShow === 'shared-with-me'}
                        setTooltipShow={() => setTooltipShow('shared-with-me')}
                        tooltipTarget={tooltipTarget}
                        setTooltipTarget={setTooltipTarget}
                      />
                      <FilterRow
                        text="Private"
                        description="Annotations created by you that you can only view"
                        checked={filters.byPermissions.private || false}
                        type="radio"
                        number={filters.byPermissions.privateNumber}
                        toggle={() => toggleFilters('byPermissions', {
                          obj: filters.byPermissions.private
                            ? {}
                            : { private: true },
                        })}
                        tooltipShow={tooltipShow === 'private'}
                        setTooltipShow={() => setTooltipShow('private')}
                        tooltipTarget={tooltipTarget}
                        setTooltipTarget={setTooltipTarget}
                      />
                      <FilterRow
                        text="Shared With Group(s)"
                        description="Annotations created by you or anyone in a group that everyone can view"
                        checked={filters.byPermissions.shared || false}
                        type="radio"
                        number={filters.byPermissions.sharedNumber}
                        toggle={() => toggleFilters('byPermissions', {
                          obj: filters.byPermissions.shared
                            ? {}
                            : { shared: true },
                        })}
                        tooltipShow={tooltipShow === 'shared'}
                        setTooltipShow={() => setTooltipShow('shared')}
                        tooltipTarget={tooltipTarget}
                        setTooltipTarget={setTooltipTarget}
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
                    <Card.Body
                      style={{ maxHeight: 'none' }}
                      className={styles.filterRowsContainer}
                    >
                      <div
                        style={{
                          display: 'flex',
                          paddingBottom: calendarOpen ? 265 : 0,
                          transition: 'padding-bottom 0.15s',
                        }}
                      >
                        <Form.Check
                          type="radio"
                          id="createdByDateRadioBtn"
                          checked={filters.byDateCreated.checked}
                          onClick={() => setByDateCreated({
                            checked: !filters.byDateCreated.checked,
                          })}
                        />
                        <div
                          style={{ display: 'flex', flexDirection: 'column', marginRight: 10 }}
                        >
                          <div>Start Date</div>
                          <DatePicker
                            selected={(typeof filters.byDateCreated.start === 'string')
                              ? parseISO(filters.byDateCreated.start)
                              : filters.byDateCreated.start}
                            onChange={(date) => setByDateCreated({ start: date })}
                            onCalendarClose={() => setCalendarOpen()}
                            onCalendarOpen={() => setCalendarOpen(true)}
                          />
                        </div>
                        <div
                          style={{ display: 'flex', flexDirection: 'column' }}
                        >
                          <div>End Date</div>
                          {filters.byDateCreated.end
                            ? (
                              <DatePicker
                                selected={(typeof filters.byDateCreated.end === 'string')
                                  ? parseISO(filters.byDateCreated.end)
                                  : filters.byDateCreated.end}
                                onChange={(date) => setByDateCreated({ end: date })}
                                onCalendarClose={() => setCalendarOpen()}
                                onCalendarOpen={() => setCalendarOpen(true)}
                              />
                            )
                            : (
                              <DatePicker
                                onChange={(date) => setByDateCreated({ end: date })}
                                onCalendarClose={() => setCalendarOpen()}
                                onCalendarOpen={() => setCalendarOpen(true)}
                              />
                            )}
                        </div>
                      </div>
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
          variant={active ? 'primary' : 'light'}
          style={active ? {} : {
            background: '#EEEEEE',
            borderColor: '#EEEEEE',
            color: '#ABABAB',
          }}
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
  checked,
  text = '',
  number = 0,
  toggle = () => {},
  description,
  type = 'checkbox',
  tooltipShow,
  setTooltipShow,
  tooltipTarget,
  setTooltipTarget,
}) {
  const ref = useRef(null);
  const descriptionExists = description && description.length > 0;
  const handleOnMouseOver = descriptionExists
    ? (event) => {
      setTooltipShow(true);
      setTooltipTarget(event.target.closest('.filterRowContainer').querySelector('.form-check-label'));
    }
    : () => {};
  const handleOnMouseOut = descriptionExists
    ? () => setTooltipShow()
    : () => {};

  const disabled = number === 0 && !checked;
  const filterRow = (
    <div
      ref={ref}
      className={`${styles.filterRowContainer} filterRowContainer`}
      onClick={disabled ? () => {} : toggle}
      onMouseOver={handleOnMouseOver}
      onMouseOut={handleOnMouseOut}
      onFocus={handleOnMouseOver}
      onBlur={handleOnMouseOut}
      tabIndex={-1}
      onKeyDown={() => {}}
      role="button"
    >
      <Form.Check
        type="checkbox"
        className={styles.filterRowCheckbox}
      >
        <Form.Check.Input type={type} checked={checked} disabled={disabled} />
        <Form.Check.Label style={{ cursor: 'pointer', paddingRight: type === 'radio' ? 10 : 0 }}>{text}</Form.Check.Label>
      </Form.Check>
      <span
        className={styles.filterRowNumber}
        style={{ color: number === 0 ? '#6c757d' : '#424242' }}
      >
        {number}
      </span>
    </div>
  );

  return (
    <>
      {filterRow}
      {descriptionExists && (
      <Overlay
        key="permission-filter-overlay"
        show={tooltipShow}
        target={tooltipTarget}
        placement="right"
        container={ref.current}
        containerPadding={20}
      >
        <Tooltip className="styled-tooltip right permissions-filter-tooltip-right">
          {description}
        </Tooltip>
      </Overlay>
      )}
    </>
  );
}
