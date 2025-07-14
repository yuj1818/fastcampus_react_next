import type { AppProps } from 'next/app';
import { Global } from '@emotion/react';
import { QueryClientProvider, QueryClient } from 'react-query';
import globalStyles from '@styles/globalStyles';
import Layout from '@shared/Layout';

const client = new QueryClient({});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Layout>
      <Global styles={globalStyles} />
      <QueryClientProvider client={client}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </Layout>
  );
}
