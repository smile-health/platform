import { RequestloginResponse } from '#types/auth'

export const getUserStorage = (): RequestloginResponse | null => {
  if (typeof window === 'undefined') return null
  const localUser = localStorage.getItem(`${process.env.STORAGE_PREFIX}USER`)
  if (!localUser) {
    return null
  }
  return JSON.parse(localUser ?? '') as RequestloginResponse
}

export const setUserStorage = (data: RequestloginResponse) =>
  localStorage.setItem(
    `${process.env.STORAGE_PREFIX}USER`,
    JSON.stringify(data)
  )

export const resetStorageUser = () =>
  localStorage.removeItem(`${process.env.STORAGE_PREFIX}USER`)
