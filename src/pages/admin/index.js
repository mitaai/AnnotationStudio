import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import LoadingSpinner from '../../components/LoadingSpinner';
import Layout from '../../components/Layout';

const AdminView = () => {
  const [session, loading] = useSession();
  return (
    <Layout type="admin">
      {loading && (
        <Card>
          <Card.Body>
            <LoadingSpinner />
          </Card.Body>
        </Card>
      )}
      {!loading && (!session || session.user.role !== 'admin') && (
        <Card>
          <Card.Body>
            Sorry, you do not have persmission to view this page.
          </Card.Body>
        </Card>
      )}
      {!loading && session && session.user.role === 'admin' && (
        <Card>
          <Card.Header>
            <Card.Title>Administration</Card.Title>
          </Card.Header>
          <Card.Body>
            This is the administration panel.
          </Card.Body>
        </Card>
      )}
    </Layout>
  );
};

export default AdminView;
