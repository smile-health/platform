export function getCurrencySymbol(locale: string) {
  return (0)
    .toLocaleString(locale, {
      style: 'currency',
      currency: process.env.CURRENCY,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, '')
    .trim()
}

export function numberFormatter(
  value: number | undefined | null,
  locale: string,
  type?: 'normal' | 'decimal' | 'currency'
) {
  if (value === undefined) return '-'
  if (['decimal', 'currency'].includes(type ?? '')) {
    const minimumFractionDigits = 2
    const maximumFractionDigits = type === 'currency' ? 2 : 3
    return value
      ? new Intl.NumberFormat(locale, {
          minimumFractionDigits,
          maximumFractionDigits,
        }).format(value)
      : '0'
  }

  return value ? new Intl.NumberFormat(locale).format(value) : '0'
}

export function formatNumberShort(value: number, language = 'en') {
  const isId = language === 'id'
  const abs = Math.abs(value)

  const trim = (n: number) =>
    Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')

  if (abs >= 1_000_000) {
    const v = abs / 1_000_000
    return (value < 0 ? '-' : '') + trim(v) + (isId ? 'jt' : 'M')
  }

  if (abs >= 1_000) {
    const v = abs / 1_000
    return (value < 0 ? '-' : '') + trim(v) + (isId ? 'rb' : 'k')
  }

  return String(value)
}

export const getBackgroundStock = (stock: number, min: number, max: number) => {
  if (!stock) return 'ui-bg-red-50'
  if (stock < min) return 'ui-bg-warning-50'
  if (!min || !max || (min <= stock && stock <= max)) return 'ui-bg-green-50'
  if (stock > max) return 'ui-bg-blue-50'
  return 'ui-bg-white'
}

export const formatPhoneNumber = (phoneNumber?: string | null) => {
  if (!phoneNumber) return null

  const cleaned = ('' + phoneNumber).trim().replace(/[\s-()]/g, '')

  const match = /^\+?(\d{2})(\d{7,})$/.exec(cleaned)

  if (!match) {
    return phoneNumber
  }

  const [, countryCode, localNumber] = match

  const part1 = localNumber.substring(0, 3)
  const part2 = localNumber.substring(3, 7)
  const part3 = localNumber.substring(7)

  return [`+${countryCode}`, part1, part2, part3].filter(Boolean).join(' ')
}
