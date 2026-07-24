import i18n from '@/locales/i18n';
import { ErrorResponse } from '@/types/common';
import { toast } from '@repo/ui/components/toast';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import Router from 'next/router';
import NProgress from 'nprogress';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { I18nextProvider } from 'react-i18next';
import { setAxiosLanguage } from 'src/lib/axios';
import { GrowthBookProvider } from '@growthbook/growthbook-react';
import { growthbook } from 'src/lib/growthbook';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for all queries
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
        // Handle other kinds of errors if necessary
        console.error('Non-Axios error:', error);
      }
    },
  }),
});

export function Provider({
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
    growthbook.init({
      streaming: true,
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(
      () => growthbook.refreshFeatures(),
      1 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <GrowthBookProvider growthbook={growthbook}>
          <Toaster gutter={12} />
          {children}
          {/* <ReactQueryDevtools initialIsOpen={false}  /> */}
        </GrowthBookProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
