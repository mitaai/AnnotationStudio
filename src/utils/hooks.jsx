import useSWR from 'swr';
import fetcher from './fetchUtil';

const useCurrentUser = () => {
  const { data, mutate } = useSWR('/api/user', fetcher);
  const user = data && data.user;
  return [user, { mutate }];
};

export default useCurrentUser;
