import { OptionType } from '#components/react-select'
import { CalendarDate } from '@internationalized/date'
import { TFunction } from 'i18next'
import { FieldError, FieldPath, FieldValues } from 'react-hook-form'

export type PeriodOfStockTakingFormData = {
  id?: number | null
  month_period: OptionType | null
  year_period: OptionType | null
  period_range: {
    start_date: CalendarDate | null
    end_date: CalendarDate | null
  } | null
  cutoff_date: CalendarDate | null
  cutoff_time: string | null
  status: number
}

export type PeriodOfStockTakingSubmitData = {
  id?: number
  month_period: number
  year_period: number
  start_date: string
  end_date: string
  cutoff_date: string
  status: number
}

export type TUseSubmitPeriodOfStockTakingReturnProps = {
  t: TFunction<['common', 'periodOfStockTaking']>
  language: string
  setError: <TFieldName extends FieldPath<FieldValues>>(
    name: TFieldName,
    error: FieldError,
    options?: {
      shouldFocus?: boolean
    }
  ) => void
}
