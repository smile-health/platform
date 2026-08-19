import { DEFAULT_LANGUAGE } from '@/constants/language';
import { removeEmptyObject } from '@/utils/object';
import {
  getAuthTokenCookies,
  removeAuthTokenCookies,
  setAuthRedirectPathCookies,
} from '@/utils/storage/auth';
import { toast } from '@repo/ui/components/toast';
import axios, { AxiosError } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    cleanParams?: boolean;
    redirect?: boolean;
    cleanBody?: boolean;
    programId?: number;
  }
}

const instance = axios.create({
  baseURL: process.env.WMS_API_URL,
  cleanParams: false,
  cleanBody: false,
});

export const setAxiosLanguage = (language: string) => {
  instance.defaults.headers.common['accept-language'] = language;
};

const redirectToLogin = () => {
  const pathname = window.location.pathname;
  const language = pathname.split('/')[2] ?? DEFAULT_LANGUAGE.value;
  const loginPath = `${process.env.NEXT_PUBLIC_URL_FE_SMILE}/${language}/v5/login`;

  removeAuthTokenCookies();
  localStorage.clear();

  toast.danger({
    description: 'Session ended: token expired or invalid',
    id: 'toast-error-unauthorized',
  });

  setAuthRedirectPathCookies();
  setTimeout(() => window.location.replace(loginPath), 100);
};

const redirectToErrorDataPages = () => {
  const { pathname } = window.location;
  const language = pathname.split('/')[1] ?? DEFAULT_LANGUAGE.value;
  window.location.replace(`/${language}/404?error=data`);
};

instance.interceptors.request.use((config) => {
  const token = getAuthTokenCookies();
  const language =
    window.location.pathname.split('/')[1] ?? DEFAULT_LANGUAGE.value;
  const acceptLanguage = config.headers.get('accept-language');

  if (!token) redirectToLogin();

  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  if (config.programId) config.headers['x-program-id'] = config.programId;
  if (config.cleanParams) config.params = removeEmptyObject(config.params);
  if (config.cleanBody) config.data = removeEmptyObject(config.data);

  if (!acceptLanguage) config.headers['accept-language'] = language;
  config.headers['device-type'] = process.env.DEVICE_TYPE;
  config.headers['timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error?.response?.status === 401) {
      redirectToLogin();
    }

    if (error?.response?.status === 404 && error.config?.redirect) {
      redirectToErrorDataPages();
    }

    if (error?.response && error?.response?.status >= 500) {
      const { message } = error.response?.data as { message: string };

      if (!message) toast.danger({ description: error.message });
    }

    return Promise.reject(
      error instanceof Error ? error : new Error('Unexpected error')
    );
  }
);

export default instance;
