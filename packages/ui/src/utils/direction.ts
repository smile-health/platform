export type TextDirection = 'ltr' | 'rtl'
// 'auto' follows the active language; 'ltr' / 'rtl' are manual overrides.
export type DirectionPreference = 'auto' | TextDirection

export const RTL_LANGUAGES = ['ar']
export const DIRECTION_STORAGE_KEY = 'smile-text-direction'
export const DIRECTION_CHANGE_EVENT = 'smile-text-direction-change'

const PREFERENCES: DirectionPreference[] = ['auto', 'ltr', 'rtl']

export const isRtlLanguage = (language?: string | null) =>
  !!language && RTL_LANGUAGES.includes(language.toLowerCase().split('-')[0])

export const resolveDirection = (
  language: string | null | undefined,
  preference: DirectionPreference = 'auto'
): TextDirection => {
  if (preference !== 'auto') return preference
  return isRtlLanguage(language) ? 'rtl' : 'ltr'
}

export const parsePreference = (
  value: string | null | undefined
): DirectionPreference =>
  PREFERENCES.includes(value as DirectionPreference)
    ? (value as DirectionPreference)
    : 'auto'

export const nextPreference = (
  current: DirectionPreference
): DirectionPreference =>
  PREFERENCES[(PREFERENCES.indexOf(current) + 1) % PREFERENCES.length]

export const getDirectionPreference = (): DirectionPreference => {
  if (typeof window === 'undefined') return 'auto'
  try {
    return parsePreference(window.localStorage.getItem(DIRECTION_STORAGE_KEY))
  } catch {
    return 'auto'
  }
}

export const applyDirection = (language: string | null | undefined) => {
  if (typeof document === 'undefined') return 'ltr'
  const dir = resolveDirection(language, getDirectionPreference())
  const html = document.documentElement
  if (language) html.lang = language
  html.dir = dir
  return dir
}

export const setDirectionPreference = (
  preference: DirectionPreference,
  language: string | null | undefined
) => {
  if (typeof window === 'undefined') return
  try {
    if (preference === 'auto')
      window.localStorage.removeItem(DIRECTION_STORAGE_KEY)
    else window.localStorage.setItem(DIRECTION_STORAGE_KEY, preference)
  } catch {
    // storage unavailable (private mode); the choice lasts for this page only
  }
  applyDirection(language)
  window.dispatchEvent(new Event(DIRECTION_CHANGE_EVENT))
}
