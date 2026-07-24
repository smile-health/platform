import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export const useIsNavigatingAway = () => {
  const [isNavigatingAway, setIsNavigatingAway] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsNavigatingAway(true)
    }

    const handleRouteChangeComplete = () => {
      setIsNavigatingAway(false)
    }

    router.events.on('routeChangeStart', handleRouteChangeStart)
    router.events.on('routeChangeComplete', handleRouteChangeComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart)
      router.events.off('routeChangeComplete', handleRouteChangeComplete)
    }
  }, [router])

  return { isNavigatingAway }
}
