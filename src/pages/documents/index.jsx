import React, { useState } from 'react';
import fetch from 'unfetch';
import { useSession } from 'next-auth/client';
import Layout from '../../components/Layout';


const DocumentsIndex = () => {
  const [session] = useSession();
  const [mine, setMine] = useState(false);

  return (
    <Layout />
  );
};

export default DocumentsIndex;
