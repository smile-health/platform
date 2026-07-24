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
}

export const listLanguage = Object.values(LANGUAGE)

export const DEFAULT_LANGUAGE = LANGUAGE.en
