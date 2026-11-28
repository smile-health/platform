import { numberFormatter } from '#utils/formatter'
import i18next from 'i18next'
import { getLocalizedStaticLabel } from '#utils/localized-name'

export const countRecommenedStockFormula = (
  max: number = 0,
  stockOnHand: number = 0,
  multiplier: number = 1
) => {
  const result =
    multiplier > 1
      ? Math.ceil((max - stockOnHand) / multiplier) * multiplier
      : max - stockOnHand
  return result > 0 ? result : undefined
}

export const minMax = (
  min: number | null,
  max: number | null,
  language: string
) => {
  return min || max
    ? `(${[
        min && `${getLocalizedStaticLabel('min', i18next.language)}: ${numberFormatter(min, language)}`,
        max && `${getLocalizedStaticLabel('max', i18next.language)}: ${numberFormatter(max, language)}`,
      ]
        .filter(Boolean)
        .join(', ')})`
    : null
}
