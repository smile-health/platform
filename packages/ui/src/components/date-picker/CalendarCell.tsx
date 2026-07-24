'use client'

 
import React from 'react'
import {
  CalendarDate,
  DateValue,
  getDayOfWeek,
  isSameDay,
  isSameMonth,
  isWeekend,
} from '@internationalized/date'
import cx from '#lib/cx'
import dayjs from 'dayjs'
import {
  mergeProps,
  useCalendarCell,
  useFocusRing,
  useLocale,
} from 'react-aria'
import type { CalendarState, RangeCalendarState } from 'react-stately'

export function CalendarCell({
  id: idProps,
  state,
  date,
  currentMonth,
}: Readonly<{
  id?: string
  date: CalendarDate
  state: CalendarState | RangeCalendarState
  currentMonth: DateValue
}>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const { locale } = useLocale()
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    isUnavailable,
    formattedDate,
  } = useCalendarCell({ date }, state, ref)

  const allDisabled = isDisabled || isUnavailable || isOutsideVisibleRange

  // The start and end date of the selected range will have
  // an emphasized appearance.
  let isSelectionStart = false
  let isSelectionEnd = false
  let isRange = false
  if ('highlightedRange' in state && state.highlightedRange) {
    isRange = true
    isSelectionStart = isSameDay(date, state.highlightedRange.start)
    isSelectionEnd = isSameDay(date, state.highlightedRange.end)
  }

  const dayOfWeek = getDayOfWeek(date, locale)

  const isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1)
  const isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date))

  const { focusProps, isFocusVisible, isFocused } = useFocusRing()

  const isOutsideMonth = !isSameMonth(currentMonth, date)

  const filteredAriaLabel =
    buttonProps['aria-label']?.match(
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d{1,2}\s+\w+\s+\d{4}\b/
    ) ?? []

  const day = dayjs(filteredAriaLabel[0])?.isValid()
    ? dayjs(filteredAriaLabel[0])?.format('YYYY-MM-DD')
    : 'test'
  
    const id = `${idProps}-${day}`

  return (
    <td
      {...cellProps}
      className={cx('ui-relative ui-py-0.5', {
        'ui-z-10': isFocusVisible || isFocused,
      })}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        id={id}
        data-testid={id}
        ref={ref}
        className={cx('ui-h-8 ui-w-8 ui-outline-none ui-group', {
          'ui-bg-primary-100': isSelected,
          '!ui-hidden': isOutsideVisibleRange || isOutsideMonth,
          'ui-rounded-l': isRoundedLeft,
          'ui-rounded-r': isRoundedRight,
        })}
      >
        <div
          className={cx(
            'ui-flex ui-h-full ui-w-full ui-items-center ui-justify-center ui-rounded ui-text-sm',
            {
              'ui-ring-2 ui-ring-primary-300 ui-ring-offset-1 group-focus:ui-z-10':
                isFocusVisible || isFocused,

              //selected but not in start or end
              'hover:ui-bg-primary-200':
                isSelected && isRange && !(isSelectionStart || isSelectionEnd),

              'ui-text-gray-700 hover:ui-bg-gray-100':
                !allDisabled && !isSelected,
              'ui-cursor-default ui-text-gray-300': allDisabled,

              'ui-text-red-600': isWeekend(date, locale) && !allDisabled,

              //selected in start or end
              'ui-bg-primary-500 ui-text-white hover:ui-bg-primary-600':
                (isSelected && !isRange) || isSelectionStart || isSelectionEnd,
            }
          )}
        >
          {formattedDate}
        </div>
      </div>
    </td>
  )
}
