import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en';
import id from './id';

const resources = {
  en,
  id,
} as const;

// apps/web (packages/ui) already calls i18next's default singleton .init() for its own
// pages. Using that same default export here would race with it — whichever init() runs
// last wins and the other set of translations disappears. createInstance() gives the WMS
// pages their own isolated i18next instance instead, wired via <I18nextProvider> in
// WmsProviders.tsx rather than the global context react-i18next sets up by default.
const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: 'id', // default language
  ns: 'common', // default namespace
  interpolation: {
    escapeValue: false, // react already safes from xss
  },
});

export default i18n;
