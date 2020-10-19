import LoadingSpinner from '../../LoadingSpinner';

const AdminGroupList = (props) => {
  const { groups, loading } = props;
  return (
    <>
      {loading && (
        <LoadingSpinner />
      )}
      {!loading && groups && (
        <>
          <>
            {JSON.stringify(groups)}
          </>
        </>
      )}
    </>
  );
};

export default AdminGroupList;
