import { OverlayTrigger, Button, Popover } from 'react-bootstrap';
import { Filter } from 'react-bootstrap-icons';


export default function ISFilterButton({
  active,
}) {
  return (
    <OverlayTrigger
      trigger="click"
      key="filter-popover"
      placement="bottom"
      rootClose
      overlay={(
        <Popover id="popover-basic">
          <Popover.Title as="h3">Popover right</Popover.Title>
          <Popover.Content>
            Hello there! this is an amazing popover right?!!
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
  );
}
