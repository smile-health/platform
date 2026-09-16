import { RequestloginResponse } from '@/types/auth';

// A bare `${process.env.WMS_STORAGE_PREFIX}USER` template literal coerces an
// unset env var to the literal string "undefined" (not ""), so every caller
// MUST go through this single helper -- a per-call `?? ''` fallback here and
// not there previously caused writes to land on "undefinedUSER" while reads
// looked at "USER", making getUserStorage() always return null whenever the
// env var was missing (silently breaking every WMS permission check and the
// header profile name, with no visible error).
const storageKey = () => `${process.env.WMS_STORAGE_PREFIX ?? ''}USER`

export const getUserStorage = (): RequestloginResponse | null => {
  if (typeof window === 'undefined') return null // keluar cepat di SSR

  try {
    const localUser = window.localStorage.getItem(storageKey())

    if (!localUser) return null
    return JSON.parse(localUser)
  } catch (error) {
    console.error('Failed to retrieve user from localStorage:', error)
    return null
  }
}


export const setUserStorage = (data: RequestloginResponse) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(storageKey(), JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to set data to localStorage:', error);
  }
};

export const resetStorageUser = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(storageKey());
    }
  } catch (error) {
    console.error('Failed to reset data from localStorage:', error);
  }
};
