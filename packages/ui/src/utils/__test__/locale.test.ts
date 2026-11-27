import { defaultPickerLocale, toIntlLocale } from '../locale'

describe('toIntlLocale', () => {
  it('forces Latin digits for Arabic', () => {
    expect(toIntlLocale('ar')).toBe('ar-u-nu-latn')
    expect(toIntlLocale('ar-SA')).toBe('ar-u-nu-latn')
    expect(new Intl.NumberFormat(toIntlLocale('ar')).format(1234)).toMatch(/1.?234/)
  })

  it('keeps other languages unchanged and defaults to en-US', () => {
    expect(toIntlLocale('id')).toBe('id')
    expect(toIntlLocale('en-UK')).toBe('en-UK')
    expect(toIntlLocale(undefined)).toBe('en-US')
  })
})

describe('defaultPickerLocale', () => {
  it('follows Arabic, keeps the old en-UK default otherwise', () => {
    expect(defaultPickerLocale('ar')).toBe('ar')
    expect(defaultPickerLocale('ar-SA')).toBe('ar-SA')
    expect(defaultPickerLocale('id')).toBe('en-UK')
    expect(defaultPickerLocale('en')).toBe('en-UK')
    expect(defaultPickerLocale(undefined)).toBe('en-UK')
  })
})
