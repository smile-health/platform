import Cookies from 'js-cookie';

// AUTH_TOKEN has a single source of truth: the shared Smile cookie (see
// getAuthTokenCookies/setAuthTokenCookies below). localStorage is only used
// for WMS's own derived user data, never the token itself.

export const getUserIdStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${process.env.WMS_STORAGE_PREFIX}USER_ID`);
};

export const setUserIdStorage = (sub: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${process.env.WMS_STORAGE_PREFIX}USER_ID`, sub);
};

export const setRefershTokenStorage = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${process.env.WMS_STORAGE_PREFIX}REFRESH_TOKEN`, token);
};

export const getRefreshTokenStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${process.env.WMS_STORAGE_PREFIX}REFRESH_TOKEN`);
};

export const removeRefreshToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${process.env.WMS_STORAGE_PREFIX}REFRESH_TOKEN`);
};

export const setAuthRedirectPathCookies = () => {
  if (typeof window === 'undefined') return;
  removeAuthRedirectPathCookies();

  const pathname = window.location.pathname;
  const query = window.location.search;
  const redirectPath = `${pathname}${query}`;

  Cookies.set(`${process.env.WMS_STORAGE_PREFIX}AUTH_REDIRECT_PATH`, redirectPath, {
    expires: 1,
    path: '/',
    sameSite: 'Strict',
    secure: true,
  });
};

// Cleans up stray AUTH_TOKEN cookies left over from before this cookie was
// always written with path: '/'. Older code (nookies.set with no path
// option) defaulted the cookie's path to the *directory* of whichever /wms
// page was open at the time, creating a second same-named cookie alongside
// Smile's real one at path '/'. document.cookie doesn't expose a cookie's
// Path attribute, so we can't detect the stray one directly — instead we
// guess every directory-prefix of the current URL (the only paths the old
// code could have used) and clear the name at each. No-ops where nothing
// exists there. Path '/' itself is left untouched — that's the real cookie.
const removeStalePathScopedAuthTokenCookies = () => {
  if (typeof window === 'undefined') return;
  const name = `${process.env.SMILE_STORAGE_PREFIX}AUTH_TOKEN`;
  const segments = window.location.pathname.split('/').filter(Boolean);

  for (let i = 1; i <= segments.length; i++) {
    Cookies.remove(name, { path: `/${segments.slice(0, i).join('/')}` });
  }
};

// Cookie functions (js-cookie works in the browser, so no change needed)
export const getAuthTokenCookies = () => {
  removeStalePathScopedAuthTokenCookies();
  return Cookies.get(`${process.env.SMILE_STORAGE_PREFIX}AUTH_TOKEN`);
};

export const setAuthTokenCookies = (token: string) => {
  Cookies.set(`${process.env.SMILE_STORAGE_PREFIX}AUTH_TOKEN`, token, {
    path: '/',
    sameSite: 'Strict',
    secure: true,
  });
};

export const removeAuthTokenCookies = () => {
  // Must match the path Smile's own login used ('/') — without it, this
  // removes a directory-scoped cookie of the same name instead of the real
  // shared one, leaving the actual session cookie behind.
  Cookies.remove(`${process.env.SMILE_STORAGE_PREFIX}AUTH_TOKEN`, { path: '/' });
};

export const getUserIdCookies = () =>
  Cookies.get(`${process.env.WMS_STORAGE_PREFIX}USER_ID`);

export const setUserIdCookies = (sub: string) => {
  Cookies.set(`${process.env.WMS_STORAGE_PREFIX}USER_ID`, sub, {
    sameSite: 'Strict',
    secure: true,
  });
};

export const removeUserIdCookies = () => {
  Cookies.remove(`${process.env.WMS_STORAGE_PREFIX}USER_ID`);
};

export const getAuthRedirectPathCookies = () => {
  return Cookies.get(`${process.env.WMS_STORAGE_PREFIX}AUTH_REDIRECT_PATH`);
};

export const removeAuthRedirectPathCookies = () => {
  Cookies.remove(`${process.env.WMS_STORAGE_PREFIX}AUTH_REDIRECT_PATH`);
};
