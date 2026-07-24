'use client'

import { ChangeEventHandler } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { CalendarDate, GregorianCalendar } from '@internationalized/date'
import { NativeSelect } from '#components/native-select'
import { CalendarProps, DateValue, useCalendar, useLocale } from 'react-aria'
import { useCalendarState } from 'react-stately'

import { CalendarButton } from './Button'
import { CalendarGrid } from './CalendarGrid'

function createCalendar(identifier: string) {
  if (identifier === 'gregory') {
    return new GregorianCalendar()
  }
  throw new Error(`Unsupported calendar ${identifier}`)
}

export function Calendar<T extends DateValue>(
  props: CalendarProps<T> & {
    id?: string
    removeOutOfYear?: boolean
  }
) {
  const { locale } = useLocale()
  const state = useCalendarState({
    ...props,
    locale,
    createCalendar,
  })

  const { calendarProps, prevButtonProps, nextButtonProps } = useCalendar(
    props,
    state
  )

  const currentDate = state.visibleRange.start

  const handleMonthChange: ChangeEventHandler<HTMLSelectElement> = (value) => {
    const newValue = value?.target?.value
    const newDate = new CalendarDate(currentDate.year, parseInt(newValue), 1)
    state.setFocusedDate(newDate)
  }

  const handleYearChange: ChangeEventHandler<HTMLSelectElement> = (value) => {
    const newValue = value?.target?.value
    const newDate = new CalendarDate(parseInt(newValue), currentDate.month, 1)
    state.setFocusedDate(newDate)
  }

  const months = [...Array(12)].map((_, i) => {
    const theDate = new CalendarDate(currentDate.year, i + 1, 1)
    const isLessThanMinDate = props?.minValue && theDate < props?.minValue
    const isGreaterThanMinDate = props?.maxValue && theDate > props?.maxValue

    return {
      value: i + 1,
      label: new Date(2024, i).toLocaleString('default', {
        month: 'long',
      }),
      disabled: isLessThanMinDate || isGreaterThanMinDate,
    }
  })

  const currentYear = currentDate.year
  const years: number[] = [...Array(200)].reduce((acc, _, i) => {
    const value = currentYear - 100 + i
    const startOfYear = new CalendarDate(value, 1, 1)
    const endOfYear = new CalendarDate(value, 12, 31)
    const isLessThanMinDate = props?.minValue && endOfYear < props?.minValue
    const isGreaterThanMinDate =
      props?.maxValue && startOfYear > props?.maxValue

    if (!isLessThanMinDate && !isGreaterThanMinDate) {
      acc.push(value)
    }

    return acc
  }, [])

  return (
    <div
      {...calendarProps}
      className="ui-px-3.5 ui-py-3.5 ui-flex ui-flex-col ui-justify-center ui-items-center"
    >
      <div className="ui-mb-5 ui-flex ui-items-center ui-justify-between ui-space-x-1">
        <CalendarButton {...prevButtonProps} id={`${props.id}-prev-button`}>
          <ChevronLeftIcon className="ui-h-4 ui-w-4 ui-text-gray-600"></ChevronLeftIcon>
        </CalendarButton>
        <div className="ui-flex ui-flex-1 ui-items-center ui-justify-center ui-text-sm ui-font-medium ui-text-gray-800 ui-gap-1">
          <NativeSelect
            id={`${props.id}-month-select`}
            size="sm"
            onChange={handleMonthChange}
            value={currentDate?.month}
          >
            {months?.map((month) => (
              <option
                key={month?.value}
                value={month?.value}
                disabled={month?.disabled as boolean}
              >
                {month?.label}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            id={`${props.id}-year-select`}
            size="sm"
            onChange={handleYearChange}
            value={currentDate?.year}
          >
            {years?.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </NativeSelect>
        </div>
        <CalendarButton {...nextButtonProps} id={`${props.id}-next-button`}>
          <ChevronRightIcon className="ui-h-4 ui-w-4 ui-text-gray-600"></ChevronRightIcon>
        </CalendarButton>
      </div>
      <CalendarGrid state={state} id={props.id} />
    </div>
  )
}
