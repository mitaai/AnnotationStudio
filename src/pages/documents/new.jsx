import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import CreateEditDocument from '../../components/CreateEditDocument';

const NewDocument = ({ statefulSession, query, refererUrl }) => {
  const [session, loading] = useSession();
  const router = useRouter();
  const pathname = refererUrl || '/documents';
  const {
    did,
    slug,
    dp,
    gid,
  } = query || {};
  const dashboardStateQuery = refererUrl ? {
    did, slug, dp, gid,
  } : {};
  return (
    <CreateEditDocument
      mode="new"
      session={session}
      loading={loading}
      statefulSession={statefulSession}
      onCancel={() => {
        router.push({
          pathname,
          query: {
            ...dashboardStateQuery,
          },
        });
      }}
      onDelete={() => {
        router.push({
          pathname,
          query: {
            ...dashboardStateQuery,
            // if we delete the document then there is no document data (slug/did) to reference in
            // the url
            slug: undefined,
            did: undefined,
          },
          alert: 'deletedDocument',
        });
      }}
      onSave={(ops) => {
        router.push({
          pathname: ops?.slug ? `/documents/${ops.slug}` : '/documents',
          query: {
            alert: 'createdDocument',
          },
        });
      }}
    />
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      ...context.props,
      query: context.query,
      refererUrl: context?.req?.headers?.referer?.split('?')[0] || null,
    },
  };
}

export default NewDocument;
