import Router from 'next/router'
import NProgress from 'nprogress'

import React from 'react'
// Styles
import '../styles/globals.css'
import '@repo/ui/styles.css'
import 'nprogress/nprogress.css'
import dynamic from 'next/dynamic'
import { Provider as PlatformProvider } from '@repo/ui/provider'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import CustomError from '@repo/ui/components/modules/CustomError'
import { useRouter } from 'next/router'

Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())

const Dynamic = dynamic(() => import('../components/Dynamic'), {
  ssr: false,
})

const MyApp = ({ Component, pageProps }) => {
  const isOnline = useOnlineStatus()
  const { query } = useRouter()

  return (
    <Dynamic>
      <PlatformProvider locale={query?.lang ? query.lang : 'id'}>
        {isOnline ? <Component {...pageProps} /> : <CustomError withLayout error="connection" />}
      </PlatformProvider>
    </Dynamic>
  )
}

export default MyApp

