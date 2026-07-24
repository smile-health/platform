import { RequestloginResponse } from '@/types/auth';

export const getUserStorage = (): RequestloginResponse | null => {
  if (typeof window === 'undefined') return null // keluar cepat di SSR

  try {
    const key = `${process.env.WMS_STORAGE_PREFIX ?? ''}USER`
    const localUser = window.localStorage.getItem(key)

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
      localStorage.setItem(
        `${process.env.WMS_STORAGE_PREFIX}USER`,
        JSON.stringify(data)
      );
    }
  } catch (error) {
    console.error('Failed to set data to localStorage:', error);
  }
};

export const resetStorageUser = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${process.env.WMS_STORAGE_PREFIX}USER`);
    }
  } catch (error) {
    console.error('Failed to reset data from localStorage:', error);
  }
};
