import React, { MouseEvent, useMemo, useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import {
  PopoverArrow,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from '#components/popover'
import dayjs from 'dayjs'
import localeData from 'dayjs/plugin/localeData'
import { useTranslation } from 'react-i18next'

import 'dayjs/locale/en'
import 'dayjs/locale/id'

import { ButtonIcon } from '#components/button-icon'
import XMark from '#components/icons/XMark'
import { OptionType, ReactSelect } from '#components/react-select'
import cx from '#lib/cx'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)
dayjs.extend(localeData)

type MonthRange = { start: string; end: string }

type MonthYearPickerProps = {
  id?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  value?: MonthRange
  onChange?: (value: MonthRange | null) => void
  minValue?: string
  maxValue?: string
  isDisabled?: boolean
  placeholder?: string
  isClearable?: boolean
  mode?: 'single' | 'range'
}

const parseMonthValue = (val: string) => {
  const [year, month] = val.split('-').map(Number)
  return { year, month }
}

const getMonthRange = (year: number, month: number): MonthRange => {
  const start = dayjs(`${year}-${month.toString().padStart(2, '0')}-01`)
  const end = start.endOf('month')
  return {
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
  }
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  id = 'month-year-picker',
  size = 'md',
  value,
  onChange,
  minValue = '2020-01',
  maxValue = `${new Date().getFullYear() + 10}-12`,
  isDisabled,
  placeholder,
  isClearable,
  mode = 'single',
}) => {
  const { i18n } = useTranslation()

  const initialYear = value?.start
    ? dayjs(value.start).year()
    : new Date().getFullYear()
  const minYear = parseMonthValue(minValue).year
  const maxYear = parseMonthValue(maxValue).year

  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(
    initialYear > maxYear ? maxYear : initialYear
  )
  const [rangeStart, setRangeStart] = useState<string | null>(null)
  const [hoveredMonth, setHoveredMonth] = useState<dayjs.Dayjs | null>(null)

  const monthLabels = useMemo(() => {
    dayjs.locale(i18n.language)
    return {
      short: dayjs.monthsShort(),
      long: dayjs.months(),
    }
  }, [i18n.language])

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      year: viewYear,
      month: i + 1,
      label: monthLabels.short[i],
    }))
  }, [viewYear, monthLabels])

  const yearOptions = useMemo(() => {
    return Array.from({ length: maxYear - minYear + 1 }, (_, i) => ({
      label: minYear + i,
      value: minYear + i,
    }))
  }, [minYear, maxYear])

  const isPrevDisabled = viewYear <= minYear || Boolean(rangeStart)
  const isNextDisabled = viewYear >= maxYear || Boolean(rangeStart)

  const handleSelectMonth = (month: number) => {
    const selectedMonthValue = `${viewYear}-${month.toString().padStart(2, '0')}`

    if (mode === 'single') {
      const range = getMonthRange(viewYear, month)
      onChange?.(range)
      setOpen(false)
    } else if (!rangeStart) {
      setRangeStart(selectedMonthValue)
      onChange?.(null)
    } else {
      const start = dayjs(rangeStart)
      const end = dayjs(selectedMonthValue)
      const [startDate, endDate] = start.isBefore(end)
        ? [start, end]
        : [end, start]
      onChange?.({
        start: startDate.startOf('month').format('YYYY-MM-DD'),
        end: endDate.endOf('month').format('YYYY-MM-DD'),
      })
      setOpen(false)
      setRangeStart(null)
    }
  }

  const handleClear = (e: MouseEvent<SVGSVGElement>) => {
    e.preventDefault()
    onChange?.(null)
    setRangeStart(null)
  }

  const displayText = useMemo(() => {
    if (!value?.start) return placeholder
    const startDate = dayjs(value.start)
    const endDate = dayjs(value.end)
    if (mode === 'single' || startDate.isSame(endDate, 'month')) {
      return `${monthLabels.long[startDate.month()]} ${startDate.year()}`
    } else {
      return `${monthLabels.long[startDate.month()]} ${startDate.year()} - ${monthLabels.long[endDate.month()]} ${endDate.year()}`
    }
  }, [value, placeholder, mode, monthLabels])

  const container = document.getElementById('filter-form-container')

  return (
    <PopoverRoot
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          const yearFromValue = value?.start
            ? dayjs(value.start).year()
            : new Date().getFullYear()
          setViewYear(yearFromValue > maxYear ? maxYear : yearFromValue)
          setRangeStart(null)
        }
        setOpen(isOpen)
      }}
    >
      <PopoverTrigger>
        <button
          id={`btn-trigger-${id}`}
          data-testid={`btn-trigger-${id}`}
          disabled={isDisabled}
          className={cx(
            'ui-inline-flex ui-items-center ui-justify-between ui-w-full ui-px-3 ui-bg-white',
            'ui-border ui-border-gray-300 ui-rounded ui-shadow-xs',
            'focus:ui-outline-none focus:ui-ring-2 focus:ui-ring-primary-500 focus:ui-ring-opacity-25 focus:ui-border-primary-300',
            {
              'ui-h-8 ui-text-sm': size === 'sm',
              'ui-h-10 ui-text-base': size === 'md',
              'ui-h-12 ui-text-lg': size === 'lg',
              'ui-h-14 ui-text-xl': size === 'xl',
            }
          )}
        >
          <span
            className={cx('ui-text-gray-500 ui-font-medium', {
              'ui-text-gray-800': !!value?.start,
            })}
          >
            {displayText}
          </span>
          {value?.start && isClearable && (
            <XMark
              id={`btn-clear-${id}`}
              data-testid={`btn-clear-${id}`}
              className="ui-text-gray-400 hover:ui-text-gray-600 focus:ui-outline-none ui-transition-colors"
              onClick={handleClear}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        container={container ?? undefined}
        className="ui-z-20"
      >
        <PopoverArrow />

        <div className="ui-mb-4 ui-flex ui-items-center ui-justify-between ui-gap-2 ui-text-sm ui-font-medium ui-text-gray-700">
          <ButtonIcon
            id={`btn-prev-${id}`}
            data-testid={`btn-prev-${id}`}
            size="md"
            variant="default"
            onClick={() => setViewYear((y) => Math.max(minYear, y - 1))}
            disabled={isPrevDisabled}
          >
            <ChevronLeftIcon className="ui-size-4 ui-text-gray-600" />
          </ButtonIcon>

          <ReactSelect
            id={`select-year-${id}`}
            data-testid={`select-year-${id}`}
            size="sm"
            value={yearOptions.find((v) => v.value === viewYear)}
            options={yearOptions}
            disabled={Boolean(rangeStart)}
            onChange={(option: OptionType) => setViewYear(option.value)}
            className="ui-z-20"
          />

          <ButtonIcon
            id={`btn-next-${id}`}
            data-testid={`btn-next-${id}`}
            size="md"
            variant="default"
            onClick={() => setViewYear((y) => Math.min(maxYear, y + 1))}
            disabled={isNextDisabled}
          >
            <ChevronRightIcon className="ui-size-4 ui-text-gray-600" />
          </ButtonIcon>
        </div>

        <div className="ui-grid ui-grid-cols-3 ui-gap-y-1 ui-items-center ui-text-sm">
          {months.map(({ year, month, label }) => {
            const key = `${year}-${month.toString().padStart(2, '0')}`
            const currentMonth = dayjs(key)

            // Date comparison variables
            const isStart =
              value?.start && currentMonth.isSame(dayjs(value.start), 'month')
            const isEnd =
              value?.end && currentMonth.isSame(dayjs(value.end), 'month')
            const isSelected = isStart || isEnd

            const isInRange =
              mode === 'range' &&
              value?.start &&
              value?.end &&
              currentMonth.isAfter(dayjs(value.start), 'month') &&
              currentMonth.isBefore(dayjs(value.end), 'month')

            const isDisabled = key < minValue || key > maxValue
            const isSameStart =
              currentMonth.isSame(dayjs(rangeStart), 'month') || isStart
            const isBeforeHoverMonth = currentMonth.isBefore(hoveredMonth)
            const highlight =
              currentMonth.isAfter(dayjs(rangeStart), 'month') &&
              isBeforeHoverMonth

            // Class name conditions
            const buttonClasses = cx(
              'ui-w-full ui-h-full ui-rounded ui-px-2 ui-py-1 ui-transition-all focus:ui-outline-none',
              {
                'ui-bg-primary-500 hover:ui-bg-primary-600 ui-text-white ui-relative ui-z-10':
                  isSelected || isSameStart,
                'ui-ring-2 ui-ring-primary-300 ui-ring-offset-1':
                  isSelected && isEnd,
                'ui-bg-primary-100 hover:ui-bg-primary-200 ui-text-primary-700 ui-rounded-none':
                  isInRange || highlight,
                'hover:ui-bg-primary-500 hover:ui-text-white hover:ui-ring-2 hover:ui-ring-primary-300 hover:ui-ring-offset-1 hover:ui-rounded':
                  rangeStart && !isSameStart,
                'ui-text-gray-700': !isSelected && !isInRange && !isSameStart,
                'hover:ui-bg-gray-100':
                  !isSameStart && !rangeStart && !isInRange,
                'ui-pointer-events-none ui-text-gray-300': isDisabled,
              }
            )

            return (
              <div
                key={key}
                className={cx({
                  'ui-bg-primary-100': isSameStart,
                })}
              >
                <button
                  id={`btn-${key}-${id}`}
                  data-testid={`btn-${key}-${id}`}
                  onClick={(e) => handleSelectMonth(month)}
                  disabled={isDisabled}
                  onMouseEnter={() => setHoveredMonth(currentMonth)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className={buttonClasses}
                >
                  {label}
                </button>
              </div>
            )
          })}
        </div>
      </PopoverContent>
    </PopoverRoot>
  )
}
