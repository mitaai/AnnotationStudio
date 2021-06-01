import React, { useContext } from 'react';
import {
  OverlayTrigger, Button, Popover, Accordion, AccordionContext, Card, useAccordionToggle,
} from 'react-bootstrap';
import {
  ChatRightQuoteFill, Filter, PeopleFill, ShieldLockFill,
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
      type="button"
      variant={isCurrentEventKey ? 'text' : 'link'}
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
                      <div className={styles.filterHeader}>
                        <ShieldLockFill size={18} style={{ marginRight: 4 }} />
                        <span>By Permissions</span>
                      </div>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byPermissions">
                    <Card.Body id="document-upload-card">
                      hello
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="annotatedBy">
                      <div className={styles.filterHeader}>
                        <ChatRightQuoteFill size={18} style={{ marginRight: 4 }} />
                        <span>Annotated By</span>
                      </div>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="annotatedBy">
                    <Card.Body id="document-upload-card">
                      hello
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
                <Card>
                  <Card.Header>
                    <ContextAwareToggle eventKey="byGroup">
                      <div className={styles.filterHeader}>
                        <PeopleFill size={18} style={{ marginRight: 4 }} />
                        <span>By Group</span>
                      </div>
                    </ContextAwareToggle>
                  </Card.Header>
                  <Accordion.Collapse eventKey="byGroup">
                    <Card.Body id="document-upload-card">
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
            padding: 5px !important;
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
