import {
  ListAnnualPlanningTargetGroupParams,
  TAnnualPlanningTargetGroupData,
} from './annual-planning-target-group-list.type'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListAnnualPlanningTargetGroupParams
    | Omit<ListAnnualPlanningTargetGroupParams, 'paginate' | 'page'>
  isExport: boolean
}) =>
  Object.entries(params).reduce((acc, [key, value]) => {
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
  data: TAnnualPlanningTargetGroupData
) => ({
  id: data.id,
})
