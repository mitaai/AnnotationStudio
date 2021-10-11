const SortableHeader = (props) => {
  const {
    field, children, sortState, setSortState, SortIcon, style
  } = props;
  return (
    <th
      onClick={() => {
        setSortState({
          field,
          direction: sortState.direction === 'desc' ? 'asc' : 'desc',
        });
      }}
      style={{ cursor: 'pointer', ...style }}
      data-testid="sortable-header"
    >
      {children}
      {' '}
      <SortIcon field={field} />
    </th>
  );
};

export default SortableHeader;
