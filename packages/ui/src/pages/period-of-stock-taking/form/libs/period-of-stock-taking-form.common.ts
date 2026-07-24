import { parseAbsolute, toCalendarDate } from '@internationalized/date'
import { OptionType } from '#components/react-select'
import dayjs from 'dayjs'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

import { PeriodOfStockTakingFormData } from './period-of-stock-taking-form.type'

export const generatedYearOptions = (): Array<OptionType> => {
  const nextYear = new Date().getFullYear() + 5
  const startYear = new Date().getFullYear() - 5
  const options = []
  for (let i = nextYear; i >= startYear; i--) {
    options.push({ value: i, label: i.toString() })
  }
  return options
}

export const generatedMonthOptions = (locale: string): Array<OptionType> => {
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const date = dayjs().month(i).locale(locale)
    return {
      value: i + 1,
      label: date.format('MMMM'),
    }
  })
  return monthNames
}

export const processingForm = (value: PeriodOfStockTakingFormData) => {
  let formatted_cutoff = ''
  if (value?.cutoff_date && value?.cutoff_time) {
    const dStr = value.cutoff_date.toString()
    const tStr = value.cutoff_time
    formatted_cutoff = `${dayjs(dStr).format('YYYY-MM-DD')} ${tStr.length > 5 ? tStr.substring(0, 8) : tStr + ':00'}`
  }

  const result = {
    id: value?.id ?? null,
    month_period: value?.month_period?.value
      ? Number(value?.month_period?.value)
      : null,
    year_period: value?.year_period?.value
      ? Number(value?.year_period?.value)
      : null,
    start_date: value?.period_range?.start_date?.toString() ?? '',
    end_date: value?.period_range?.end_date?.toString() ?? '',
    cutoff_date: formatted_cutoff,
    status: value?.status ?? 0,
  }
  return result
}

export const internationalizedDateFromISO = (date: string | null) => {
  if (!date) return null
  const parsedDate = parseAbsolute(date, 'Asia/Jakarta')
  return toCalendarDate(parsedDate)
}

export const toastDateFormatter = (date?: string, locale?: string) => {
  if (!date) return ''
  return dayjs(date)
    .locale(locale ?? 'en')
    .format('DD MMM YYYY')
}