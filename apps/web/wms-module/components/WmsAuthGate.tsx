import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@repo/ui/components/spinner';
import { useFirebaseMessaging } from '@repo/ui/hooks/useFirebaseMessaging';
import { checkToken } from '@/redux/actions/auth';
import { sendFCMToken } from '@/services/notification';
import { getAuthTokenCookies } from '@/utils/storage/auth';

/**
 * Replaces the standalone wms app's /validate-token page (see the old
 * frontend-turborepo/apps/wms/src/pages/validate-token). That page existed only because
 * wms used to be a separate origin — it read the shared smile auth cookie, called the
 * wms backend to validate it, then redirected into the real page once done. Now that WMS
 * pages live in the same app/session, there's nothing to redirect to: this gate does the
 * same token check inline and renders the page in place once it resolves.
 *
 * The backend call itself (checkToken -> API_URL + /set-auth) is UNCHANGED — it still
 * hits the standalone wms backend, since that hasn't been merged into the platform yet.
 */
export function WmsAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const lang = (router.query?.lang as string) || 'id'
  const dispatch = useDispatch()
  const auth = useSelector((state: any) => state.auth)
  const { token: fcmToken } = useFirebaseMessaging()
  const [redirecting, setRedirecting] = useState(false)
  const lastCheckedTokenRef = useRef<string | null>(null)

  const isAuthReady = !auth.isProcessCheckToken && auth.data_login !== null

  useQuery({
    queryKey: ['fcm-token', fcmToken],
    queryFn: () => sendFCMToken(fcmToken!),
    enabled: isAuthReady && !!fcmToken,
    retry: false,
  })

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthTokenCookies()

      // Re-validate whenever the underlying Smile cookie's token actually
      // changes (e.g. a fresh login elsewhere) instead of only once per
      // mount — WmsRouteWrapper stays mounted across /wms/* navigation, so
      // a one-time check would keep using a stale token after re-login.
      if (lastCheckedTokenRef.current === token) return
      lastCheckedTokenRef.current = token ?? null

      if (typeof token === 'string') {
        dispatch(checkToken(token, lang) as any)
      } else {
        // Same-app login now, instead of the old cross-origin redirect to
        // NEXT_PUBLIC_URL_FE_SMILE.
        setRedirecting(true)
        router.replace(`/${lang}/v5/login`)
      }
    }

    checkAuth()
    router.events.on('routeChangeComplete', checkAuth)
    return () => router.events.off('routeChangeComplete', checkAuth)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (redirecting || !isAuthReady) {
    return (
      <div className="ui-h-screen ui-w-full ui-flex ui-items-center ui-justify-center">
        <Spinner className="ui-h-8 ui-w-8" />
      </div>
    )
  }

  return <>{children}</>
}
