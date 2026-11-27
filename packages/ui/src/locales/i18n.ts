import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en";
import id from "./id";
import ar from "./ar";
import { registerDayjsLocales } from "../utils/dayjs-locale";

// Dipanggil eksplisit: packages/ui ditandai sideEffects-free, jadi import
// tanpa binding akan dibuang bundler.
registerDayjsLocales();

const resources = {
  en,
  id,
  ar,
} as const;

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // default language
    ns: "common", // default namespace
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
