import {
  ListAnnualPlanningSubstitutionParams,
  TAnnualPlanningSubstitutionData,
} from './annual-planning-substitution-list.type'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { isObject } from '#utils/object'

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListAnnualPlanningSubstitutionParams
    | Omit<ListAnnualPlanningSubstitutionParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.entries(params).reduce((acc, [key, value]) => {
    if (isObject(value)) return { ...acc, [key]: value?.value }
    if (isExport && ['paginate', 'page']?.includes(key)) return acc
    return { ...acc, [key]: value }
  }, {})

export const capitalize = (text: string) => {
  if (text.includes(' '))
    return text
      .split(' ')
      .map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
      .join(' ')
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() || ''
}

export const thousandFormatter = ({
  value,
  locale = 'en-US',
}: {
  value: number
  locale: string
}) => {
  return new Intl.NumberFormat(locale).format(value) || ''
}

export const processingEnableDisableStatus = (
  data: TAnnualPlanningSubstitutionData
) => ({
  id: data.id,
})
