import { parseCookies, destroyCookie } from 'nookies';
import { Button, Card } from 'react-bootstrap';
import Router from 'next/router';
import fetch from 'isomorphic-unfetch';
import { useSession } from 'next-auth/client';
import Layout from '../components/Layout';
import { AddUserToGroup } from '../utils/groupUtil';
import { StripQuery } from '../utils/stringUtil';

export default function Home({ props }) {
  const [session, loading] = useSession();
  const { groupId } = props;
  return (
    <Layout>
      {session && !loading && groupId !== '' && (
        <Card style={{ width: '33%', marginLeft: '33%' }} className="text-center">
          <Card.Header>Join Group</Card.Header>
          <Card.Body>
            You have been invited to join a group.
            <br />
            <Button
              className="mt-3"
              onClick={() => {
                destroyCookie(null, 'ans_grouptoken', {
                  path: '/',
                });
                AddUserToGroup({ id: groupId }, session.user.email, false).then(() => {
                  Router.push({
                    pathname: '/',
                    query: { alert: 'joinedGroup' },
                  });
                }).catch((err) => {
                  Router.push(
                    {
                      pathname: StripQuery(Router.asPath),
                      query: { error: err.message },
                    },
                  );
                });
              }}
            >
              Join Group
            </Button>
          </Card.Body>
        </Card>
      )}
      {' '}
      Welcome to Annotation Studio.
    </Layout>
  );
}

Home.getInitialProps = async (context) => {
  const { query } = context;
  const cookies = parseCookies(context);
  let groupId = '';
  if (query.alert === 'completeRegistration') {
    destroyCookie(context, 'ans_grouptoken', {
      path: '/',
    });
  } else if (cookies.ans_grouptoken) {
    const url = `${process.env.SITE}/api/invite/${cookies.ans_grouptoken}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.status === 200) {
      const result = await res.json();
      groupId = result.group;
    }
  }
  return {
    props: {
      query,
      groupId,
    },
  };
};
