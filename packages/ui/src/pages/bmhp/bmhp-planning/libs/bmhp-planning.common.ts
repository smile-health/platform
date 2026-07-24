import { OptionType } from '#components/react-select'
import { TFunction } from 'i18next'

const LIMIT_YEAR = 100

/**
 * Generate year options for dropdowns
 * @param yearsDisabled - Array of years to disable (already exist)
 * @param t - Translation function
 * @returns Array of year options for ReactSelect
 */
export const generatedYearOptions = (
  yearsDisabled: number[] = [],
  t?: TFunction
): Array<OptionType> => {
  const nextYear = new Date().getFullYear() + LIMIT_YEAR
  const startYear = new Date().getFullYear()
  const options = []

  for (let i = startYear; i <= nextYear; i++) {
    const year = t ? `${i.toString()}` : i.toString()
    options.push({
      value: i,
      label: yearsDisabled.includes(i) ? year : i.toString(),
      isDisabled: yearsDisabled.includes(i),
    })
  }

  return options
}
