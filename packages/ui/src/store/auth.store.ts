import { toast } from '#components/toast'
import {
  getAuthTokenCookies,
  removeAuthTokenCookies,
  setAuthRedirectPathCookies,
  setAuthTokenCookies,
  setRefreshTokenStorage,
} from '#utils/storage/auth'
import { create } from 'zustand'
import { queryClient } from '../provider/query-client'

interface State {
  event: 'default' | 'login' | 'logout' | 'unauthorized' | 'unauthenticated'
  isAuthenticated: boolean
  login: (
    data: { token: string; refreshToken: string },
    callback?: () => void
  ) => void
  logout: (callback?: () => void) => void
  unauthenticated: () => void
  unauthorized: () => void
}

export const useAuth = create<State>((set) => ({
  event: 'default',
  isAuthenticated: getAuthTokenCookies() ? true : false,
  login: (data) => {
    setAuthTokenCookies(data.token)
    setRefreshTokenStorage(data.refreshToken)
    //redirect to program
    set(() => {
      return { isAuthenticated: true, event: 'login' }
    })
  },
  logout: () => {
    removeAuthTokenCookies()
    sessionStorage.clear()
    localStorage.clear()
    queryClient.clear()

    //redirect to login
    set(() => {
      return { isAuthenticated: false, event: 'logout' }
    })
  },
  unauthenticated: () => {
    setAuthRedirectPathCookies()
    set(() => {
      return { isAuthenticated: false, event: 'unauthenticated' }
    })
  },
  unauthorized: () => {
    removeAuthTokenCookies()
    sessionStorage.clear()
    localStorage.clear()
    queryClient.clear()

    toast.danger({
      description: 'Session ended: logged in on another device',
      id: 'toast-error-unauthorized',
    })
    setAuthRedirectPathCookies()
    set(() => {
      return { isAuthenticated: false, event: 'unauthorized' }
    })
  },
}))
