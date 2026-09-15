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

const DEFAULT_BASE_URL = process.env.API_BASE_URL

const instance = axios.create({
  baseURL: DEFAULT_BASE_URL,
  cleanParams: false,
  cleanBody: false,
})

// Every call site across the app hardcodes its own service prefix into the
// request path (e.g. axios.get('/core/master/locations')) rather than
// setting its own baseURL -- historically fine, since baseURL was always
// just API_BASE_URL and the prefix was part of the same URL either way.
// But that means a per-service override (API_CORE_URL etc., set directly
// in .env.* to point at a service running standalone on its own port
// locally) had no effect on the vast majority of calls: only the handful
// of files that already passed their own explicit `baseURL` per-request
// actually consulted it.
//
// Fix that once, here, instead of touching every call site: when a
// request's url starts with a known service prefix and it didn't already
// set its own baseURL, route it to that service's URL (override or
// derived default, whichever env.ts resolved) and strip the prefix --
// core's (and every other service's) own routes never had the prefix
// built in to begin with, Nginx adds/strips it in front, so the
// unprefixed path is what a directly-hit local service actually expects.
// When nothing is overridden, this resolves to exactly the same final URL
// as before (API_CORE_URL defaults to `${API_BASE_URL}/core`).
const SERVICE_BASE_URL_BY_PREFIX: [prefix: string, baseUrl?: string][] = [
  ['/core', process.env.API_CORE_URL],
  ['/main', process.env.API_MAIN_URL],
  ['/auth', process.env.API_AUTH_URL],
  ['/warehouse-report', process.env.API_BIG_DATA_URL],
]

instance.interceptors.request.use((config) => {
  // axios merges the instance's own default baseURL into `config` before
  // request interceptors run, so `config.baseURL` is never falsy here even
  // for a call that never set one itself -- comparing against the known
  // default is the only way to tell "this call didn't set its own baseURL"
  // apart from "this call explicitly set baseURL to something else".
  if (config.baseURL === DEFAULT_BASE_URL && config.url) {
    const match = SERVICE_BASE_URL_BY_PREFIX.find(([prefix]) =>
      config.url!.startsWith(prefix)
    )
    if (match) {
      const [prefix, baseUrl] = match
      config.baseURL = baseUrl
      config.url = config.url.slice(prefix.length) || '/'
    }
  }
  return config
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
      // '/login', not '/auth/login': the request interceptor above strips
      // the '/auth' service prefix before the request is sent, and
      // error.config reflects that already-rewritten url, not the
      // original one requestlogin() called with.
      error.config?.url !== '/login' &&
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
