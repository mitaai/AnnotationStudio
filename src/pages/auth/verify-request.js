
import { useSession } from 'next-auth/client';
import { Button, Card } from 'react-bootstrap';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';

const VerifyRequest = () => {
  const [session, loading] = useSession();
  return (
    <Layout
      type="signin"
    >
      {!session && loading && (
        <LoadingSpinner />
      )}
      {!session && !loading && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
          <Card.Header><Card.Title>Check your email</Card.Title></Card.Header>
          <Card.Body>
            <strong>A sign-in link has been sent to your email address.</strong>
            <br />
            <br />
            Be sure to check your Spam or Junk mail.
          </Card.Body>
        </Card>
      )}
      {session && !loading && (
      <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
        <Card.Header>Log In / Sign Up</Card.Header>
        <Card.Body>
          You are now logged in.
          <br />
          <Button
            className="mt-3"
            href="/"
          >
            Go to Dashboard
          </Button>
        </Card.Body>
      </Card>
      )}
    </Layout>
  );
};

export default VerifyRequest;
