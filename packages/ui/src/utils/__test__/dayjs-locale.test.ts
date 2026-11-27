import dayjs from 'dayjs'
import '../dayjs-locale'

describe('dayjs Arabic locale', () => {
  it('uses Arabic month names with Latin digits', () => {
    expect(dayjs('2026-11-05').locale('ar').format('MMMM YYYY')).toBe(
      'نوفمبر 2026'
    )
    expect(dayjs('2026-01-15').locale('ar').format('DD MMMM')).toBe(
      '15 يناير'
    )
  })

  it('does not change English formatting', () => {
    expect(dayjs('2026-11-05').locale('en').format('MMMM YYYY')).toBe(
      'November 2026'
    )
  })
})
