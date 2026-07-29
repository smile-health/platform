import React, { useEffect, useRef, useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@repo/ui/components/spinner';
import { useFirebaseMessaging } from '@repo/ui/hooks/useFirebaseMessaging';
import { checkToken, resultLogin } from '@/redux/actions/auth';
import { sendFCMToken } from '@/services/notification';

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
  const hasCheckedRef = useRef(false)

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
    if (hasCheckedRef.current) return
    hasCheckedRef.current = true

    const token = Cookies.get(`${process.env.SMILE_STORAGE_PREFIX}AUTH_TOKEN`)

    if (typeof token === 'string') {
      dispatch(checkToken(token, lang) as any)
    } else {
      // Bypass WMS auth check — main app uses Keycloak, not the WMS module's
      // standalone token-auth. The WMS backend still validates on each API call via
      // the main app's auth header. Without this bypass every WMS page redirects to
      // /v5/login which creates an infinite loop.
      dispatch(resultLogin({} as any));
    }
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
