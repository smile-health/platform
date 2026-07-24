import { numberFormatter } from '#utils/formatter'

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
        min && `min: ${numberFormatter(min, language)}`,
        max && `max : ${numberFormatter(max, language)}`,
      ]
        .filter(Boolean)
        .join(', ')})`
    : null
}
