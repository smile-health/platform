// Define valid locales
export const defaultLocale: 'id' | 'en' | 'ar' = 'en' // Explicitly typing defaultLocale

// List of valid languages
export const langs: ('id' | 'en' | 'ar')[] = ['id', 'en', 'ar'] 

// List of valid locales
export const locales: ('id' | 'en' | 'ar')[] = ['id', 'en', 'ar'] 

// Language names for each locale
export const languageNames: { [key in 'id' | 'en' | 'ar']: string } = {
  id: 'Indonesia',
  en: 'English',
  ar: 'العربية',
}
