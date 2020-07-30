import { useSession } from 'next-auth/client';
import { Card } from 'react-bootstrap';
import Layout from '../../../components/Layout';

const ViewGroup = ({ group }) => {
  const [session, loading] = useSession();
  return (
    <Layout>
      <Card>
        <Card.Header>
          {session && !loading && group.name}
        </Card.Header>
        <Card.Body>
          {session && !loading && JSON.stringify(group)}
        </Card.Body>
      </Card>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;

  const url = `${process.env.SITE}/api/group/${id}`;
  // eslint-disable-next-line no-undef
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: context.req.headers.cookie,
    },
  });
  if (res.status === 200) {
    const foundGroup = await res.json();
    const {
      name,
      members,
    } = foundGroup;
    const group = {
      name,
      members,
    };
    return {
      props: { group },
    };
  }
  return {
    props: { },
  };
}

export default ViewGroup;
