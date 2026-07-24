import { useContext } from 'react';
import { LocaleContext } from '../context/localeContext';
import { defaultLocale } from '../translations/config';
import strings from '../translations/strings';

type Locale = 'id' | 'en'; // Define the valid locales

interface TranslationStrings {
  [key: string]: string;
}

interface Strings {
  id: TranslationStrings;
  en: TranslationStrings;
}

// Ensure strings is of type Strings
const typedStrings: Strings = strings as Strings;

export default function useTranslation() {
  // Destructure and ensure default value for `locale`
  const { locale } = useContext(LocaleContext) || { locale: defaultLocale };

  // Narrow `locale` type to 'id' | 'en' (fallback to defaultLocale if invalid)
  const currentLocale: Locale =
    locale === 'id' || locale === 'en' ? locale : defaultLocale;

  function __(key: string): string {
    // Access the strings for the current locale, with a fallback if the key doesn't exist
    const translation = typedStrings[currentLocale][key];
    if (!translation) {
      console.warn(
        `Translation '${key}' for locale '${currentLocale}' not found.`
      );
    }
    return translation || key;
  }

  function trans(key: string): string {
    return __(key);
  }

  return {
    __,
    trans,
    locale: currentLocale,
  };
}
