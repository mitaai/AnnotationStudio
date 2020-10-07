import { useSession } from 'next-auth/client';
import {
  Card,
} from 'react-bootstrap';
import AdminPanel from '../../components/Admin/AdminPanel';
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
        <AdminPanel />
      )}
    </Layout>
  );
};

export default AdminView;
