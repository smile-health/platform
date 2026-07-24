import Cookies from 'js-cookie'

//----------Auth Token------------
export const getAuthTokenCookies = () =>
  Cookies.get(`${process.env.STORAGE_PREFIX}AUTH_TOKEN`)

export const setAuthTokenCookies = (token: string) => {
  //compatibility with old storage
  localStorage.setItem(`${process.env.STORAGE_PREFIX}AUTH_TOKEN`, token)
  Cookies.set(`${process.env.STORAGE_PREFIX}AUTH_TOKEN`, token, {
    sameSite: 'Strict',
    secure: true,
  })
}

export const removeAuthTokenCookies = () => {
  localStorage.removeItem(`${process.env.STORAGE_PREFIX}AUTH_TOKEN`)
  Cookies.remove(`${process.env.STORAGE_PREFIX}AUTH_TOKEN`)
}

//-----------Redirect----------------
export const setAuthRedirectPathCookies = () => {
  removeAuthRedirectPathCookies()

  const pathname = window.location.pathname

  if (pathname.includes('login')) {
    return
  }

  const query = window.location.search
  const redirectPath = `${pathname}${query}`
  console.log('redirectPath', redirectPath)

  Cookies.set(`${process.env.STORAGE_PREFIX}AUTH_REDIRECT_PATH`, redirectPath, {
    expires: 1,
    path: '/',
    sameSite: 'Strict',
    secure: true,
  })
}

export const getAuthRedirectPathCookies = () => {
  return Cookies.get(`${process.env.STORAGE_PREFIX}AUTH_REDIRECT_PATH`)
}

export const removeAuthRedirectPathCookies = () => {
  Cookies.remove(`${process.env.STORAGE_PREFIX}AUTH_REDIRECT_PATH`)
}

//-----------Refresh Token----------------
export const setRefreshTokenStorage = (token: string) =>
  localStorage.setItem(`${process.env.STORAGE_PREFIX}REFRESH_TOKEN`, token)

export const getRefreshTokenStorage = () => {
  return localStorage.getItem(`${process.env.STORAGE_PREFIX}REFRESH_TOKEN`)
}

export const removeRefreshToken = () =>
  localStorage.removeItem(`${process.env.STORAGE_PREFIX}REFRESH_TOKEN`)
