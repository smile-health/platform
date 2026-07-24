import { BOOLEAN } from '#constants/common'
import dayjs from 'dayjs'

import {
  ListPeriodOfStockTakingParams,
  TPeriodOfStockTakingData,
} from './period-of-stock-taking-list.type'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

export const processParams = ({
  params,
  isExport = false,
}: {
  params:
    | ListPeriodOfStockTakingParams
    | Omit<ListPeriodOfStockTakingParams, 'paginate' | 'page'>
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
  data: TPeriodOfStockTakingData,
  locale: string
) => ({
  id: data.id,
  status: data.status === BOOLEAN.TRUE ? BOOLEAN.FALSE : BOOLEAN.TRUE,
  month_period: data.month_period,
  year_period: data.year_period,
  start_date: data.start_date
    ? dayjs(data.start_date).locale(locale).format('YYYY-MM-DD')
    : null,
  end_date: data.end_date
    ? dayjs(data.end_date).locale(locale).format('YYYY-MM-DD')
    : null,
})
