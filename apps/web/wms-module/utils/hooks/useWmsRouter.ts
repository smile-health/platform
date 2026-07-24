import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

// The standalone wms app ran with Next's `basePath: '/wms'`, which auto-prepended
// '/wms' to every internal push/href built here. Now that WMS pages are routed at
// apps/web/pages/wms/[lang]/** with no basePath, that prefix has to be added explicitly
// instead, or internal navigation lands one level too shallow (e.g. /id/module instead
// of /wms/id/module).
const WMS_PREFIX = '/wms';

function getUrl(url: string, language: string, query?: Record<string, string>) {
  const normalizedUrl = url?.startsWith('/') ? url : `/${url}`;
  const languagePrefix = `/${language}`;

  const newUrl =
    normalizedUrl === languagePrefix ||
    normalizedUrl.startsWith(languagePrefix + '/')
      ? normalizedUrl
      : `${languagePrefix}${normalizedUrl}`;

  const prefixedUrl = newUrl.startsWith(WMS_PREFIX + '/')
    ? newUrl
    : `${WMS_PREFIX}${newUrl}`;

  const searchParams = new URLSearchParams(query);
  let result = prefixedUrl;

  if (searchParams.size) {
    result = `${result}?${searchParams.toString()}`;
  }

  return result;
}

export default function useWmsRouter() {
  const {
    i18n: { language },
  } = useTranslation();
  const router = useRouter();

  function createUrl() {
    return (url: string, query?: Record<string, string>) => {
      const normalizedUrl = url?.startsWith('/') ? url : `/${url}`;
      const languagePrefix = `/${language}`;

      const langScopedPath =
        normalizedUrl === languagePrefix ||
        normalizedUrl.startsWith(languagePrefix + '/')
          ? normalizedUrl
          : `${languagePrefix}${normalizedUrl}`;

      // router.asPath is the real current URL, which does include /wms — match that
      // here so the "same path, keep existing query" check below still fires correctly.
      const targetPath = langScopedPath.startsWith(WMS_PREFIX + '/')
        ? langScopedPath
        : `${WMS_PREFIX}${langScopedPath}`;

      const [currentPath, currentQueryString] = router.asPath.split('?');

      const normalizedTargetPath = targetPath.replace(/\/$/, '') || '/';
      const normalizedCurrentPath = currentPath.replace(/\/$/, '') || '/';

      if (normalizedTargetPath === normalizedCurrentPath && !query) {
        const existingQuery: Record<string, string> = {};
        if (currentQueryString) {
          const params = new URLSearchParams(currentQueryString);
          params.forEach((value, key) => {
            existingQuery[key] = value;
          });
        }
        return getUrl(url, language, existingQuery);
      }

      return getUrl(url, language, query);
    };
  }

  function createRouterMethod(method: 'push' | 'replace') {
    const getUrlFn = createUrl();
    return (url: string, query?: Record<string, string>) =>
      router[method](getUrlFn(url, query));
  }

  return {
    ...router,
    getAsLink: createUrl(),
    push: createRouterMethod('push'),
    replace: createRouterMethod('replace'),
    nextRouter: router.push,
    nextReplace: router.replace,
  };
}
