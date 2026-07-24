import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { Spinner } from '#components/spinner'
import { useTheme } from '#hooks/useTheme'
import { getProfileV2 } from '#services/profile'
import { useAuth } from '#store/auth.store'
import { sortObjectsByKey } from '#utils/array'
import { resetTheme } from '#utils/color'
import {
  getAuthRedirectPathCookies,
  removeAuthRedirectPathCookies,
} from '#utils/storage/auth'
import { removeProgramStorage, setProgramStorage } from '#utils/storage/program'
import { getUserStorage, setUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const {
    i18n: { language },
  } = useTranslation('login')

  const params = useParams()
  const programPath = params?.program
  const router = useRouter()

  const { setTheme } = useTheme()

  async function fetchProfile() {
    const profile = await getProfileV2()
    const userData = {
      id: profile.id,
      email: profile.email,
      entity: profile.entity,
      programs: sortObjectsByKey(profile.programs, 'name'),
      role: profile.role,
      token: '',
      username: profile.username,
      manufacture: profile.manufacture,
      view_only: profile.view_only,
      firstname: profile.firstname,
      lastname: profile.lastname,
      external_roles: profile.external_roles,
      external_properties: profile.external_properties,
      integration_client_id: profile.integration_client_id,
      is_disabled_notification: profile?.is_disabled_notification,
    }

    setUserStorage(userData)
    handleChangeProgram()
    return userData
  }

  const { isAuthenticated, event } = useAuth()

  const query = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    enabled: isAuthenticated && router.isReady,
    staleTime: Infinity,
  })

  function handleChangeProgram() {
    const userData = getUserStorage()
    if (userData === null) {
      return
    }

    if (!programPath) {
      removeProgramStorage()
      resetTheme()
    }

    if (programPath) {
      const activeProgram = userData.programs.find((p) => p.key === programPath)

      //check is program available in user profile
      if (!activeProgram) {
        router.push(`/${language}/v5/404`)
        return
      }
      //check program status is active
      if (!activeProgram.status) {
        router.push(`/${language}/v5/program`)
        return
      }

      setProgramStorage(activeProgram)
      setTheme()
    }
  }

  useEffect(() => {
    handleChangeProgram()
  }, [programPath])

  useEffect(() => {
    if (!isAuthenticated) {
      if (['/[lang]/v5/forgot-password'].includes(router.pathname)) {
        return
      }

      if (!['/[lang]/v5/login'].includes(router.pathname)) {
        router.replace(`/${language}/v5/login`)
        resetTheme()
      }
      return
    }

    if (isAuthenticated) {
      if (['/[lang]', '/'].includes(router.pathname)) {
        router.replace(`/${language}/v5/program`)
        return
      }

      if (router.pathname === '/[lang]/v5/login') {
        router.replace(`/${language}/v5/program`)
        return
      }
    }
  }, [isAuthenticated, router.pathname])

  useEffect(() => {
    if (event === 'login') {
      const redirect = getAuthRedirectPathCookies()
      removeAuthRedirectPathCookies()

      if (redirect) {
        router.push(redirect)
      } else {
        router.push(`/${language}/v5/program`)
      }
    }

    if (event === 'logout') {
      resetTheme()
      window.location.href = `/${language}/v5/login`
    }

    if (event === 'unauthorized') {
      router.push(`/${language}/v5/login`)
      resetTheme()
    }

    if (event === 'unauthenticated') {
      router.push(`/${language}/v5/login`)
      resetTheme()
    }
  }, [event])

  if (!router.isReady) {
    return null
  }

  if (query.isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner className="text-primary-600 h-10 w-10" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        Error fetching profile
      </div>
    )
  }

  return <>{children}</>
}

export default AuthProvider
