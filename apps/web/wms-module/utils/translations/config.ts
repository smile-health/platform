// Define valid locales
export const defaultLocale: 'id' | 'en' = 'id'; // Explicitly typing defaultLocale

// List of valid languages
export const langs: ('id' | 'en')[] = ['id', 'en']; // Typing the array to only include 'id' and 'en'

// List of valid locales
export const locales: ('id' | 'en')[] = ['id', 'en']; // Typing the array to only include 'id' and 'en'

// Language names for each locale
export const languageNames: { [key in 'id' | 'en']: string } = {
  id: 'Indonesia',
  en: 'English',
};
