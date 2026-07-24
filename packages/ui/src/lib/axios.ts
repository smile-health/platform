import { toast } from '#components/toast'
import { DEFAULT_LANGUAGE } from '#constants/language'
import { useAuth } from '#store/auth.store'
import { removeEmptyObject } from '#utils/object'
import { getAuthTokenCookies } from '#utils/storage/auth'
import { getProgramStorage } from '#utils/storage/program'
import axios, { AxiosError } from 'axios'

declare module 'axios' {
  export interface AxiosRequestConfig {
    cleanParams?: boolean
    redirect?: boolean
    cleanBody?: boolean
    programId?: number
  }
}

const instance = axios.create({
  baseURL: process.env.API_URL_V5,
  cleanParams: false,
  cleanBody: false,
})

export const setAxiosLanguage = (language: string) => {
  instance.defaults.headers.common['accept-language'] = language
}

const redirectToErrorDataPages = () => {
  const { pathname } = window.location
  const language = pathname.split('/')[1] ?? DEFAULT_LANGUAGE.value
  window.location.replace(`/${language}/404?error=data`)
}

instance.interceptors.request.use((config) => {
  const token = getAuthTokenCookies()
  const language =
    window.location.pathname.split('/')[1] ?? DEFAULT_LANGUAGE.value
  const program = getProgramStorage()
  const acceptLanguage = config.headers.get('accept-language')

  if (!token) {
    useAuth.getState().unauthenticated()
  }

  // config.headers['ngrok-skip-browser-warning'] = 'true'
  if (token) config.headers['Authorization'] = `Bearer ${token}`
  if (program) config.headers['x-program-id'] = program.id
  if (config.programId) config.headers['x-program-id'] = config.programId
  if (config.cleanParams) config.params = removeEmptyObject(config.params)
  if (config.cleanBody) config.data = removeEmptyObject(config.data)

  if (!acceptLanguage) config.headers['accept-language'] = language
  config.headers['device-type'] = process.env.DEVICE_TYPE
  config.headers['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone

  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.config?.url !== '/auth/login' &&
      error?.response?.status === 401
    ) {
      useAuth.getState().unauthorized()
    }

    if (error?.response?.status === 404 && error.config?.redirect) {
      toast.danger({ description: 'Data not found' })
      redirectToErrorDataPages()
    }

    if (error?.response && error?.response?.status >= 500) {
      const { message } = error.response?.data as { message: string }

      if (!message) toast.danger({ description: error.message })
    }

    return Promise.reject(
      error instanceof Error ? error : new Error('Unexpected error')
    )
  }
)

export default instance
