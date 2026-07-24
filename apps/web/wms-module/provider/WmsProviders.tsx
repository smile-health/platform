import i18n from '@/locales/i18n';
import { wmsStore } from '@/redux/clientStore';
import { ErrorResponse } from '@/types/common';
import { toast } from '@repo/ui/components/toast';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { isAxiosError } from 'axios';
import Router from 'next/router';
import NProgress from 'nprogress';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import { Provider as ReduxProvider } from 'react-redux';
import { setAxiosLanguage } from '@/lib/axios';
import { growthbook } from '@/lib/growthbook';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error: unknown) => {
      if (isAxiosError(error)) {
        if (error.response?.status === 401) {
          return;
        }
        toast.danger({
          id: 'error-message',
          description:
            (error.response?.data as ErrorResponse)?.message || error.message,
        });
      } else {
        console.error('Non-Axios error:', error);
      }
    },
  }),
});

// Ported from the standalone wms app's src/provider/index.tsx (see apps/web/pages/wms).
// Only mounted for /wms/* routes (see pages/_app.js) — everything else on the platform
// keeps using @repo/ui's own Provider/i18n/query-client, untouched.
export function WmsProviders({
  children,
  locale,
}: Readonly<{
  children: React.ReactNode;
  locale: string;
}>) {
  useEffect(() => {
    i18n.changeLanguage(locale);
    setAxiosLanguage(locale);

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, [locale]);

  useEffect(() => {
    growthbook.init({ streaming: true });
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => growthbook.refreshFeatures(),
      1 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <ReduxProvider store={wmsStore}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <GrowthBookProvider growthbook={growthbook}>
            <Toaster gutter={12} />
            {children}
          </GrowthBookProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </ReduxProvider>
  )
}
