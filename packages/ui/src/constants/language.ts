import FlagAr from '#components/icons/FlagAr'
import FlagId from '#components/icons/FlagId'
import FlagUs from '#components/icons/FlagUs'

export const LANGUAGE = {
  id: {
    value: 'id',
    label: 'Indonesia',
    icon: FlagId,
  },
  en: {
    value: 'en',
    label: 'English',
    icon: FlagUs,
  },
  ar: {
    value: 'ar',
    label: 'العربية',
    icon: FlagAr,
  },
}

export const listLanguage = Object.values(LANGUAGE)

export const DEFAULT_LANGUAGE = LANGUAGE.en
