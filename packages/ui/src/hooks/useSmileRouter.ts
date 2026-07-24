import { useRouter } from 'next/router'
import { getProgramStorage } from '#utils/storage/program'
import { useTranslation } from 'react-i18next'

function getUrl(
  url: string,
  language: string,
  programKey?: string | null,
  query?: Record<string, string>,
  isGlobal?: boolean
) {
  const searchParams = new URLSearchParams(query)
  const program = getProgramStorage()
  const newUrl = url?.startsWith('/') ? url : `/${url}`

  const programPath = isGlobal ? '' : `/${programKey ?? program?.key}`
  let result = `/${language}${programPath}${newUrl}`

  if (searchParams.size) {
    result = `${result}?${searchParams.toString()}`
  }

  return result
}

export default function useSmileRouter() {
  const {
    i18n: { language },
  } = useTranslation()
  const router = useRouter()

  function createUrl(global = false) {
    return (
      url: string,
      programKey?: string | null,
      query?: Record<string, string>
    ) => getUrl(url, language, programKey, query, global)
  }

  function createRouterMethod(method: 'push' | 'replace', global = false) {
    const getUrlWithGlobal = createUrl(global)
    return (
      url: string,
      programKey?: string | null,
      query?: Record<string, string>
    ) => router[method](getUrlWithGlobal(url, programKey, query))
  }

  return {
    ...router,
    getAsLink: createUrl(),
    getAsLinkGlobal: createUrl(true),
    push: createRouterMethod('push'),
    pushGlobal: createRouterMethod('push', true),
    replace: createRouterMethod('replace'),
    replaceGlobal: createRouterMethod('replace', true),
    nextRouter: router.push,
    nextReplace: router.replace,
  }
}
