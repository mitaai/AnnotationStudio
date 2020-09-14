import dynamic from 'next/dynamic';
import LoadingSpinner from '../LoadingSpinner';

const QuillNoSSRWrapper = dynamic(() => import('react-quill'),
  {
    ssr: false,
    loading: () => <LoadingSpinner />,
  });

export default QuillNoSSRWrapper;
