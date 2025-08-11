import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Global } from '@emotion/react';
import { QueryClientProvider, QueryClient, Hydrate } from 'react-query';
import globalStyles from '@styles/globalStyles';
import Layout from '@shared/Layout';
import Navbar from '@shared/Navbar';
import { AlertContextProvider } from '@contexts/AlertContext';
import ErrorBoundary from '@shared/ErrorBoundary';
import { useReportWebVitals } from 'next/web-vitals';

const client = new QueryClient({});

export default function App({
  Component,
  pageProps: { dehydratedState, session, ...pageProps },
}: AppProps) {
  useReportWebVitals((metric) => {
    console.log(metric);
  });

  return (
    <Layout>
      <Global styles={globalStyles} />
      <SessionProvider session={session}>
        <QueryClientProvider client={client}>
          <Hydrate state={dehydratedState}>
            <ErrorBoundary>
              <AlertContextProvider>
                <Navbar />
                <Component {...pageProps} />
              </AlertContextProvider>
            </ErrorBoundary>
          </Hydrate>
        </QueryClientProvider>
      </SessionProvider>
    </Layout>
  );
}
