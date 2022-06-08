import { useSession } from 'next-auth/client';
import CreateEditDocument from '../../components/CreateEditDocument';

const NewDocument = ({ statefulSession }) => {
  const [session, loading] = useSession();
  return (
    <CreateEditDocument
      mode="new"
      session={session}
      loading={loading}
      statefulSession={statefulSession}
    />
  );
};

export default NewDocument;
