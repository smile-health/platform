'use client'

import {
  DateDuration,
  endOfMonth,
  getWeeksInMonth,
} from '@internationalized/date'
import { useCalendarGrid, useLocale } from 'react-aria'
import { CalendarState, RangeCalendarState } from 'react-stately'

import { CalendarCell } from './CalendarCell'

export function CalendarGrid({
  id,
  state,
  offset = {},
}: Readonly<{
  id?: string
  state: CalendarState | RangeCalendarState
  offset?: DateDuration
}>) {
  const { locale } = useLocale()
  const startDate = state.visibleRange.start.add(offset)
  const endDate = endOfMonth(startDate)

  const { gridProps, headerProps, weekDays } = useCalendarGrid(
    {
      startDate,
      endDate,
    },
    state
  )

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale)

  return (
    <table {...gridProps} cellPadding="0">
      <thead {...headerProps}>
        <tr>
          {weekDays.map((day, index) => (
            <th
              className="ui-pb-0.5 ui-text-sm ui-font-medium ui-text-gray-500"
              key={`${day}-${index}`}
            >
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth)].map((_, weekIndex) => {
          const datesInWeek = state.getDatesInWeek(weekIndex, startDate)

          return (
            <tr key={`${datesInWeek?.toString()}-${weekIndex}`}>
              {datesInWeek.map((date, i) =>
                date ? (
                  <CalendarCell
                    key={JSON.stringify(date) + i}
                    id={id}
                    state={state}
                    date={date}
                    currentMonth={startDate}
                  />
                ) : (
                  <td key={i + 1} />
                )
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
