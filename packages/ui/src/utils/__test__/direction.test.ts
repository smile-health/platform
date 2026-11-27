import {
  applyDirection,
  DIRECTION_STORAGE_KEY,
  getDirectionPreference,
  isRtlLanguage,
  nextPreference,
  parsePreference,
  resolveDirection,
  setDirectionPreference,
} from '../direction'

describe('direction', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.removeAttribute('dir')
    document.documentElement.removeAttribute('lang')
  })

  it('detects RTL languages including regional tags', () => {
    expect(isRtlLanguage('ar')).toBe(true)
    expect(isRtlLanguage('ar-SA')).toBe(true)
    expect(isRtlLanguage('AR')).toBe(true)
    expect(isRtlLanguage('en')).toBe(false)
    expect(isRtlLanguage('id')).toBe(false)
    expect(isRtlLanguage(undefined)).toBe(false)
  })

  it('follows the language when preference is auto', () => {
    expect(resolveDirection('ar')).toBe('rtl')
    expect(resolveDirection('id', 'auto')).toBe('ltr')
  })

  it('lets a manual preference override the language', () => {
    expect(resolveDirection('ar', 'ltr')).toBe('ltr')
    expect(resolveDirection('en', 'rtl')).toBe('rtl')
  })

  it('parses unknown stored values as auto', () => {
    expect(parsePreference('rtl')).toBe('rtl')
    expect(parsePreference('sideways')).toBe('auto')
    expect(parsePreference(null)).toBe('auto')
  })

  it('cycles auto -> ltr -> rtl -> auto', () => {
    expect(nextPreference('auto')).toBe('ltr')
    expect(nextPreference('ltr')).toBe('rtl')
    expect(nextPreference('rtl')).toBe('auto')
  })

  it('applies lang and dir to <html>', () => {
    expect(applyDirection('ar')).toBe('rtl')
    expect(document.documentElement.dir).toBe('rtl')
    expect(document.documentElement.lang).toBe('ar')
    applyDirection('en')
    expect(document.documentElement.dir).toBe('ltr')
  })

  it('persists the override and clears it on auto', () => {
    const listener = jest.fn()
    window.addEventListener('smile-text-direction-change', listener)
    setDirectionPreference('rtl', 'en')
    expect(window.localStorage.getItem(DIRECTION_STORAGE_KEY)).toBe('rtl')
    expect(getDirectionPreference()).toBe('rtl')
    expect(document.documentElement.dir).toBe('rtl')
    expect(listener).toHaveBeenCalledTimes(1)

    setDirectionPreference('auto', 'en')
    expect(window.localStorage.getItem(DIRECTION_STORAGE_KEY)).toBeNull()
    expect(document.documentElement.dir).toBe('ltr')
    window.removeEventListener('smile-text-direction-change', listener)
  })
})
