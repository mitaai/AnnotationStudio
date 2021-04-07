import { Pagination } from 'react-bootstrap';

const Paginator = ({
  page,
  totalPages,
  setPage,
}) => (
  <Pagination style={{ justifyContent: 'center' }}>
    <Pagination.First disabled={page === 1} onClick={() => setPage(1)} />
    <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
    {page !== 1
      && (
        <>
          {[...Array(page).keys()].map((i) => (
            i + 1 < page && (
              <Pagination.Item
                key={`page${i + 1}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            )
          ))}
        </>
      )}
    <Pagination.Item active>{page}</Pagination.Item>
    {totalPages > 1
      && (
        <>
          {[...Array(totalPages).keys()].map((i) => (
            i + 1 > page && (
              <Pagination.Item
                key={`page${i + 1}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            )
          ))}
        </>
      )}
    <Pagination.Next
      disabled={page === totalPages || totalPages === 0}
      onClick={() => setPage(page + 1)}
    />
    <Pagination.Last
      disabled={page === totalPages || totalPages === 0}
      onClick={() => setPage(totalPages)}
    />
  </Pagination>
);

export default Paginator;
