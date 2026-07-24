'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import {
  CalendarDate,
  createCalendar,
  isSameDay,
} from '@internationalized/date'
import { OptionType } from '#components/react-select'
import { TSingleOptions } from '#types/common'
import {
  DateValue,
  RangeCalendarProps,
  useLocale,
  useRangeCalendar,
} from 'react-aria'
import { RangeCalendarState, useRangeCalendarState } from 'react-stately'

import { CalendarButton } from './Button'
import { CalendarGrid } from './CalendarGrid'
import { Dropdown, DropdownItem } from './Dropdown'

const getEffectiveAnchor = (state: RangeCalendarState) => {
  const { anchorDate, value } = state
  // kalau anchor kebetulan “nempel” di end, pakai start saja
  if (
    anchorDate &&
    value?.end &&
    isSameDay(anchorDate, value.end) &&
    value?.start
  ) {
    return value.start
  }
  return anchorDate
}

export function RangeCalendar(
  props: RangeCalendarProps<DateValue> & {
    id?: string
    multiCalendar?: boolean
    maxRange?: number
  }
) {
  const startRef = useRef<CalendarDate | DateValue | null>(null)

  const { locale } = useLocale()
  const state = useRangeCalendarState({
    ...props,
    visibleDuration: { months: props.multiCalendar ? 2 : 1 },
    locale,
    createCalendar,
    isDateUnavailable: (date) => {
      const startDate = startRef?.current
      if (startDate && props?.maxRange) {
        const maxEndDate = startDate.add({ days: props?.maxRange })
        const minEndDate = startDate.subtract({ days: props?.maxRange })

        return date.compare(maxEndDate) > 0 || date.compare(minEndDate) < 0
      }

      return props.isDateUnavailable ? props.isDateUnavailable(date) : false
    },
  })

  const ref = useRef<HTMLDivElement>(null)
  const { calendarProps, prevButtonProps, nextButtonProps } = useRangeCalendar(
    props,
    state,
    ref
  )

  useEffect(() => {
    startRef.current = getEffectiveAnchor(state)
  }, [state])

  const currentDate = state.visibleRange.end

  const months = [...Array(12)].map((_, i) => ({
    value: i + 1,
    label: new Date(2024, i).toLocaleString('default', { month: 'long' }),
  }))

  const currentYear = currentDate.year
  const years: OptionType[] = [...Array(200)].reduce((acc, _, i) => {
    const value = currentYear - 100 + i
    const theDate = new CalendarDate(value, currentDate.month, 1)
    const isLessThanMinDate = props?.minValue && theDate < props?.minValue
    const isGreaterThanMinDate = props?.maxValue && theDate > props?.maxValue

    if (!isLessThanMinDate && !isGreaterThanMinDate) {
      acc.push({ value, label: value })
    }

    return acc
  }, [])

  const [openMonth, setOpenMonth] = useState(false)
  const [openYear, setOpenYear] = useState(false)

  const handleMonthChange = (newValue: TSingleOptions) => {
    const newDate = new CalendarDate(
      currentDate.year,
      parseInt(newValue.value as string),
      1
    )
    state.setFocusedDate(newDate)
    setOpenMonth(false)
  }

  const handleYearChange = (newValue: TSingleOptions) => {
    const newDate = new CalendarDate(
      parseInt(newValue.value as string),
      currentDate.month,
      1
    )
    state.setFocusedDate(newDate)
    setOpenYear(false)
  }

  const selectedMonth = months.find(
    (month) => month.value === currentDate.month
  )

  const selectedYear = years.find((year) => year.value === currentDate.year)

  return (
    <div {...calendarProps} ref={ref} className="ui-p-5">
      <div className="ui-mb-5 ui-flex ui-items-center ui-justify-between ui-space-x-1">
        <CalendarButton {...prevButtonProps} id={`${props.id}-prev-button`}>
          <ChevronLeftIcon className="ui-h-4 ui-w-4 ui-text-gray-600"></ChevronLeftIcon>
        </CalendarButton>
        <div className="ui-flex ui-flex-1 ui-items-center ui-justify-center ui-text-sm ui-font-medium ui-text-gray-800 ui-gap-1">
          {props.multiCalendar && (
            <div className="ui-flex ui-items-center ui-gap-1">
              {
                months.find((month) =>
                  currentDate.month > 1
                    ? month.value === currentDate.month - 1
                    : month.value === 12
                )?.label
              }
              {currentDate.month === 1 && ` ${currentYear - 1}`}
              <div>-</div>
            </div>
          )}
          <Dropdown
            label={selectedMonth?.label}
            open={openMonth}
            setOpen={setOpenMonth}
          >
            {months?.map((item) => (
              <DropdownItem
                key={item?.label}
                label={item?.label}
                isSelected={item?.value === selectedMonth?.value}
                onClick={() => handleMonthChange(item)}
              />
            ))}
          </Dropdown>

          <Dropdown
            label={selectedYear?.label}
            open={openYear}
            setOpen={setOpenYear}
          >
            {years?.map((item) => (
              <DropdownItem
                key={item?.label}
                label={item?.label}
                isSelected={item?.value === selectedYear?.value}
                onClick={() => handleYearChange(item)}
              />
            ))}
          </Dropdown>
        </div>
        <CalendarButton {...nextButtonProps} id={`${props.id}-next-button`}>
          <ChevronRightIcon className="ui-h-4 ui-w-4 ui-text-gray-600"></ChevronRightIcon>
        </CalendarButton>
      </div>
      <div className="ui-flex ui-gap-5">
        <CalendarGrid state={state} id={props.id} />
        {props.multiCalendar ? (
          <CalendarGrid state={state} offset={{ months: 1 }} id={props.id} />
        ) : null}
      </div>
    </div>
  )
}
