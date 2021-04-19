import {
  Button,
  ButtonGroup,
  Badge,
} from 'react-bootstrap';


export default function PermissionsButtonGroup({ buttons }) {
  // buttons is an array of objects with properties onClick, selected, text, count, icon

  const permissionTextMargin = 3;
  const badgeNumWidth = 7.25;
  const badgeInitWidth = 8.25 + permissionTextMargin;

  const b = buttons.map(({
    onClick, selected, text, count, icon, textWidth,
  }) => {
    const width = selected ? textWidth
    + badgeInitWidth
    + badgeNumWidth * (count > 0
      ? Math.floor(Math.log10(count) + 1)
      : 1) : 0;
    return (
      <Button
        key={text}
        variant={selected ? 'primary' : 'outline-primary'}
        onClick={onClick}
      >
        {icon}
        <div className="mine" style={{ width }}>
          <span className="text">{text}</span>
          <Badge variant="light">{count}</Badge>
        </div>
      </Button>
    );
  });
  return (
    <>
      <ButtonGroup size="sm" aria-label="Permissions" className="permissions-buttons">
        {b}
      </ButtonGroup>
      <style jsx global>
        {`

        .permissions-buttons .btn div {
          transition: width 0.5s, opacity 1s;
          overflow: hidden;
          padding-left: 9px;
          white-space: nowrap;
          opacity: 0;
        }

        .permissions-buttons .btn svg {
          position: absolute;
          top: 6px;
          left: 5px;
        }

        .permissions-buttons .btn {
          height: 31px;
        }

        .permissions-buttons .btn.btn-outline-primary div {
          width: 0px;
        }

        .permissions-buttons .badge {
          position: relative;
          top: -2px !important;
        }

        .permissions-buttons .btn.btn-primary div > .text {
          margin-right: ${permissionTextMargin}px;
        }

        .permissions-buttons .btn.btn-primary div.mine {
          margin-left: 10px;
          opacity: 1;
        }

        .permissions-buttons .btn.btn-primary div.shared-with-groups {
          margin-left:10px;
          opacity: 1;
        }

        .permissions-buttons .btn.btn-primary div.shared-with-me {
          margin-left: 10px;
          opacity: 1;
        }
      `}
      </style>
    </>
  );
}
