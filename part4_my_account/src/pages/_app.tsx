import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Global } from '@emotion/react';
import { QueryClientProvider, QueryClient, Hydrate } from 'react-query';
import globalStyles from '@styles/globalStyles';
import Layout from '@shared/Layout';
import Navbar from '@shared/Navbar';
import AuthGuard from '@components/auth/AuthGuard';
import { AlertContextProvider } from '@contexts/AlertContext';

const client = new QueryClient({});

export default function App({
  Component,
  pageProps: { dehydratedState, session, ...pageProps },
}: AppProps) {
  return (
    <Layout>
      <Global styles={globalStyles} />
      <SessionProvider session={session}>
        <QueryClientProvider client={client}>
          <Hydrate state={dehydratedState}>
            <AlertContextProvider>
              <AuthGuard>
                <Navbar />
                <Component {...pageProps} />
              </AuthGuard>
            </AlertContextProvider>
          </Hydrate>
        </QueryClientProvider>
      </SessionProvider>
    </Layout>
  );
}
