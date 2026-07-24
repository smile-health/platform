import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/dist/client/router';

import { isLocale } from '../translations/types';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

export const LocaleContext = React.createContext<LocaleContextType>({
  locale: 'id',
  setLocale: () => {},
});

interface LocaleProviderProps {
  lang: string;
  children: ReactNode;
}

export const LocaleProvider = ({ lang, children }: LocaleProviderProps) => {
  const [locale, setLocale] = useState<string>(lang || 'id');
  const { query } = useRouter();

  useEffect(() => {
    if (
      locale !== localStorage.getItem(process.env.WMS_STORAGE_PREFIX + 'APP_LOCALE')
    ) {
      localStorage.setItem(process.env.WMS_STORAGE_PREFIX + 'APP_LOCALE', locale);
    }
  }, [locale]);

  useEffect(() => {
    if (
      typeof query?.lang === 'string' &&
      isLocale(query?.lang) &&
      locale !== query?.lang
    ) {
      setLocale(query?.lang || 'id');
    }
  }, [query?.lang, locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};
