import React, { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { GrowthBookProvider } from '@growthbook/growthbook-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ExportAsyncPopup from '#components/modules/ExportAsyncPopup'
import LoadingPopup from '#components/modules/LoadingPopup'
import { setAxiosLanguage } from '#lib/axios'
import { growthbook } from '#lib/growthbook'
import { Toaster } from 'react-hot-toast'
import { I18nextProvider } from 'react-i18next'

import i18n from '../locales/i18n'
import AuthProvider from './auth-provider'
import MiscProvider from './misc-provider'
import { PushNotificationProvider } from './push-notification-provider'
import { queryClient } from './query-client'

const whitelistLoadingPopup = ['/[lang]/v5/403', '/[lang]/v5/login']

export function Provider({
  children,
  locale,
}: Readonly<{
  children: React.ReactNode
  locale: string
}>) {
  const router = useRouter()

  const hideLoadingPopup = useMemo(() => {
    return whitelistLoadingPopup.some((x) => router.pathname.includes(x))
  }, [router.pathname])

  useEffect(() => {
    i18n.changeLanguage(locale)
    setAxiosLanguage(locale)
  }, [locale])

  useEffect(() => {
    growthbook.init({
      streaming: true,
    })
  }, [])

  useEffect(() => {
    const interval = setInterval(
      () => growthbook.refreshFeatures(),
      1 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [])

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <GrowthBookProvider growthbook={growthbook}>
          <Toaster gutter={12} />
          {!hideLoadingPopup && <LoadingPopup />}
          <ExportAsyncPopup />
          <PushNotificationProvider>
            <AuthProvider>
              <MiscProvider>{children}</MiscProvider>
            </AuthProvider>
          </PushNotificationProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </GrowthBookProvider>
      </QueryClientProvider>
    </I18nextProvider>
  )
}

export function LangProvider({
  children,
  locale,
}: Readonly<{
  children: React.ReactNode
  locale?: string
}>) {

  // useEffect(() => {
  //   i18n.changeLanguage(locale)
  //   setAxiosLanguage(locale)
  // }, [locale])
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
