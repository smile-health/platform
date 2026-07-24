import { TOperatorThirdparty } from '@/types/partnership-operator';

export const getUserOperatorStorage = (): TOperatorThirdparty | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const localUser = localStorage?.getItem(
        `${process.env.WMS_STORAGE_PREFIX}USER_OPERATOR`
      );
      return localUser ? JSON.parse(localUser) : null;
    }
  } catch (error) {
    console.error('Failed to retrieve from localStorage:', error);
  }

  return null;
};

export const setUserOperatorStorage = (data: TOperatorThirdparty) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(
        `${process.env.WMS_STORAGE_PREFIX}USER_OPERATOR`,
        JSON.stringify(data)
      );
    }
  } catch (error) {
    console.error('Failed to set data to localStorage:', error);
  }
};

export const resetStorageUserOperator = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(`${process.env.WMS_STORAGE_PREFIX}USER_OPERATOR`);
    }
  } catch (error) {
    console.error('Failed to reset data from localStorage:', error);
  }
};
