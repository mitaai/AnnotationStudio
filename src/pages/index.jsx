import Layout from '../components/Layout';

export default function Home() {
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
