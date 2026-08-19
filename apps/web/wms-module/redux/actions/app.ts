import Axios from 'axios';
import { getAuthTokenCookies, removeAuthTokenCookies } from '@/utils/storage/auth';

export const APP_SHOW_MESSAGE = 'APP_SHOW_MESSAGE';
export const APP_HIDE_MESSAGE = 'APP_HIDE_MESSAGE';

Axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const workspaceStorage = sessionStorage.getItem(
      `${process.env.WMS_STORAGE_PREFIX}PROGRAM`
    );
    const workspace = workspaceStorage ? JSON.parse(workspaceStorage) : null;

    return {
      ...config,
      headers: {
        Authorization:
          config?.headers?.Authorization ?? 'Bearer ' + getAuthTokenCookies(),
        'accept-language': window.location.pathname.split('/')[1] ?? 'id',
        'device-type': process.env.DEVICE_TYPE,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(workspace && {
          'x-program-id': workspace.id,
        }),
      },
    };
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
Axios.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    if (error.response) {
      const { status } = error.response;

      if (Number(status) === 401) {
        removeAuthTokenCookies();
      }
    }
    // Any status codes that fall   s outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export const APP_SET_IS_TON = 'APP_SET_IS_TON';

export const showMessage = (message: string, type: string) => ({
  type: APP_SHOW_MESSAGE,
  payload: {
    message: message,
    message_type: type ?? '',
  },
});

export const hideMessage = () => ({
  type: APP_HIDE_MESSAGE,
});

export const setIsTon = (isTon: boolean) => ({
  type: APP_SET_IS_TON,
  payload: {
    isTon,
  },
});
