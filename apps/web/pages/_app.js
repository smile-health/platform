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

// Only fetched/mounted for /wms/* routes — carries its own Redux store and a second,
// isolated i18next instance (see wms-module/provider/WmsProviders.tsx), so it's kept
// out of the bundle for every other page via next/dynamic.
const WmsRouteWrapper = dynamic(
  () => import('../wms-module/components/WmsRouteWrapper'),
  { ssr: false }
)

const MyApp = ({ Component, pageProps }) => {
  const isOnline = useOnlineStatus()
  const { query, pathname } = useRouter()
  const isWmsRoute = pathname === '/wms' || pathname.startsWith('/wms/')

  const page = isOnline ? (
    <Component {...pageProps} />
  ) : (
    <CustomError withLayout error="connection" />
  )

  return (
    <Dynamic>
      {isWmsRoute ? (
        <WmsRouteWrapper>{page}</WmsRouteWrapper>
      ) : (
        <PlatformProvider locale={query?.lang ? query.lang : 'id'}>
          {page}
        </PlatformProvider>
      )}
    </Dynamic>
  )
}

export default MyApp

