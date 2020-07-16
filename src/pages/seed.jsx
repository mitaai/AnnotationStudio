import Layout from '../components/Layout';
import seedDb from '../utils/seedUtil';

export default function Seed() {
  return (
    <Layout>
      Welcome to Annotation Studio.
    </Layout>
  );
}

export async function getServerSideProps(context) {
  return {
    props: { query: context.query }, // will be passed to the page component as props
  };
}
