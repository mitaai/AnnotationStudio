const SortableHeader = (props) => {
  const {
    field, children, sortState, setSortState, SortIcon,
  } = props;
  return (
    <th
      onClick={() => {
        setSortState({
          field,
          direction: sortState.direction === 'desc' ? 'asc' : 'desc',
        });
      }}
      style={{ cursor: 'pointer' }}
    >
      {children}
      {' '}
      <SortIcon field={field} />
    </th>
  );
};

export default SortableHeader;
