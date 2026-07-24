import Axios from 'axios';
import nookies from 'nookies';
import store from 'store2';

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
          config?.headers?.Authorization ??
          'Bearer ' + store.get(process.env.WMS_STORAGE_PREFIX + 'AUTH_TOKEN'),
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
        const nameToken = process.env.WMS_STORAGE_PREFIX + 'AUTH_TOKEN';

        nookies.destroy(null, nameToken);
        store.remove(nameToken);
        store.remove(process.env.WMS_STORAGE_PREFIX + 'AUTH');
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
