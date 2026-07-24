import Cookies from 'js-cookie';

export const getAuthTokenStorage = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`${process.env.WMS_STORAGE_PREFIX}AUTH_TOKEN`);
};

export const setAuthTokenStorage = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${process.env.WMS_STORAGE_PREFIX}AUTH_TOKEN`, token);
};

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

// Cookie functions (js-cookie works in the browser, so no change needed)
export const getAuthTokenCookies = () =>
  Cookies.get(`${process.env.WMS_STORAGE_PREFIX}AUTH_TOKEN`);

export const setAuthTokenCookies = (token: string) => {
  Cookies.set(`${process.env.WMS_STORAGE_PREFIX}AUTH_TOKEN`, token, {
    sameSite: 'Strict',
    secure: true,
  });
};

export const removeAuthTokenCookies = () => {
  Cookies.remove(`${process.env.WMS_STORAGE_PREFIX}AUTH_TOKEN`);
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
