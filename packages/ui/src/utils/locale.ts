// Locale passed to Intl / react-aria. Arabic keeps Latin digits (decided in
// BA-949): `ar` alone formats numbers and dates with Arabic-Indic digits.
export const toIntlLocale = (language?: string | null) => {
  if (!language) return 'en-US'
  const base = language.toLowerCase().split('-')[0]
  if (base === 'ar') return 'ar-u-nu-latn'
  return language
}
