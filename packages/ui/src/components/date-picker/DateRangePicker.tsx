'use client'

import React, { useEffect, useState } from 'react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { parseDate } from '@internationalized/date'
import cx from '#lib/cx'
import dayjs from 'dayjs'
import { AnimatePresence } from 'framer-motion'
import { TFunction } from 'i18next'
import {
  AriaDateRangePickerProps,
  DateValue,
  I18nProvider,
  useDateRangePicker,
} from 'react-aria'
import { useTranslation } from 'react-i18next'
import { useDateRangePickerState } from 'react-stately'

import { FieldButton } from './Button'
import { ClearButton } from './ClearButton'
import { DateField } from './DateField'
import { Dialog } from './Dialog'
import { Popover } from './Popover'
import { RangeCalendar } from './RangeCalendar'

type Preset = {
  id: string
  label: string
  getValue: () => {
    start: DateValue
    end: DateValue
  }
}

const presets = (t: TFunction, id?: string): Array<Preset> => [
  {
    id: `${id}-preset-today`,
    label: t('date.preset.today'),
    getValue: () => {
      const today = dayjs()
      return {
        start: parseDate(today.format('YYYY-MM-DD')),
        end: parseDate(today.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-this-week`,
    label: t('date.preset.this.week'),
    getValue: () => {
      const now = dayjs()
      const start = now.startOf('week')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(now.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-this-month`,
    label: t('date.preset.this.month'),
    getValue: () => {
      const now = dayjs()
      const start = now.startOf('month')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(now.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-this-year`,
    label: t('date.preset.this.year'),
    getValue: () => {
      const now = dayjs()
      const start = now.startOf('year')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(now.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-last-7-days`,
    label: t('date.preset.last.days', { day: 7 }),
    getValue: () => {
      const end = dayjs()
      const start = end.subtract(6, 'day') // 6 because we want to include today
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(end.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-last-30-days`,
    label: t('date.preset.last.days', { day: 30 }),
    getValue: () => {
      const end = dayjs()
      const start = end.subtract(29, 'day') // 29 because we want to include today
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(end.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-last-month`,
    label: t('date.preset.last.month'),
    getValue: () => {
      const now = dayjs()
      const lastMonth = now.subtract(1, 'month')
      const start = lastMonth.startOf('month')
      const end = lastMonth.endOf('month')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(end.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-last-3-months`,
    label: t('date.preset.last.months', { month: 3 }),
    getValue: () => {
      const now = dayjs()
      const lastQuarter = now.subtract(3, 'month')
      const start = lastQuarter.startOf('month')
      const end = lastQuarter.endOf('month').add(2, 'month')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(end.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-last-6-months`,
    label: t('date.preset.last.months', { month: 6 }),
    getValue: () => {
      const now = dayjs()
      const lastSixMonths = now.subtract(6, 'month')
      const start = lastSixMonths.startOf('month')
      const end = lastSixMonths.endOf('month').add(5, 'month')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(end.format('YYYY-MM-DD')),
      }
    },
  },
  {
    id: `${id}-preset-last-year`,
    label: t('date.preset.last.year'),
    getValue: () => {
      const now = dayjs()
      const lastYear = now.subtract(1, 'year')
      const start = lastYear.startOf('year')
      const end = lastYear.endOf('year')
      return {
        start: parseDate(start.format('YYYY-MM-DD')),
        end: parseDate(end.format('YYYY-MM-DD')),
      }
    },
  },
]

function Preset({
  selectedPreset,
  onClick,
  presets,
}: Readonly<{
  selectedPreset: string
  presets: Array<Preset>
  onClick: (item: Preset) => void
}>) {
  return (
    <div className="ui-border-r ui-border-gray-300 ui-p-2 ui-space-y-1">
      {presets.map((item) => (
        <button
          id={item?.id}
          data-testid={item?.id}
          key={item.label}
          onClick={() => onClick(item)}
          className={cx(
            'ui-w-full ui-text-sm ui-text-gray-700 ui-text-left ui-px-2 ui-py-1 rounded',
            'focus:ui-outline-none focus:ui-ring-2  focus:ui-ring-opacity-40',
            {
              'ui-bg-primary-500 ui-text-white ': selectedPreset === item.label,
            }
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function DateRangePicker(
  props: AriaDateRangePickerProps<DateValue> & {
    error?: boolean
    required?: boolean
    multiCalendar?: boolean
    locale?: string
    clearable?: boolean
    withPreset?: boolean
    maxRange?: number
  }
) {
  const { t } = useTranslation()
  const state = useDateRangePickerState(props)
  const ref = React.useRef(null)
  const {
    groupProps,
    startFieldProps,
    endFieldProps,
    buttonProps,
    dialogProps,
    calendarProps,
  } = useDateRangePicker(props, state, ref)

  const [isInvalid, setIsInvalid] = useState(false)
  const allError = state.isInvalid || props.error || isInvalid

  //this is hack for framer motion
  const [isOpen, setIsOpen] = useState(false)
  useEffect(() => {
    setIsOpen(state.isOpen)
  }, [state.isOpen])

  const presetList = React.useMemo(
    () => presets(t, props.id),
    [t, props.id]
  )

  // Derive the active preset from the current value so the highlight stays in
  // sync on reset, manual calendar change, or clear (instead of stale state).
  const selectedPreset = React.useMemo(() => {
    const start = state.value?.start
    const end = state.value?.end
    if (!start || !end) return ''
    const matched = presetList.find((preset) => {
      const range = preset.getValue()
      return start.compare(range.start) === 0 && end.compare(range.end) === 0
    })
    return matched?.label ?? ''
  }, [state.value, presetList])

  const [focusedDate, setFocusedDate] = React.useState<DateValue | undefined>(
    undefined
  )
  const handlePresetClick = (preset: Preset) => {
    state.setValue(preset.getValue())
    setFocusedDate(preset.getValue().start)
  }

  React.useEffect(() => {
    if (props.maxRange && props?.value) {
      const over =
        props.value?.end.compare(
          props.value?.start.add({ days: props.maxRange })
        ) > 0
      setIsInvalid(over)
    }
  }, [props.maxRange, props.value])

  return (
    <I18nProvider locale={props.locale ?? 'en-UK'}>
      <div className="ui-relative ui-flex ui-w-full ui-flex-col ui-text-left">
        <div
          {...groupProps}
          ref={ref}
          className={cx(
            'ui-flex ui-items-center ui-justify-center ui-rounded ui-border ui-pr-1',
            'ui-h-10',
            'group-[.is-group]:first:!ui-rounded-l-none',
            'focus-within:ui-ring-2 focus-within:ui-ring-opacity-25',
            {
              'ui-cursor-not-allowed ui-bg-gray-100 ui-opacity-75':
                props.isDisabled,
            },
            {
              'ui-border-gray-300': !allError,
              'ui-border-danger-500': allError,
            },
            {
              'focus-within:ui-border-danger-500 focus-within:ui-ring-danger-500':
                allError,
              'focus-within:ui-border-primary-500 focus-within:ui-ring-primary-500':
                !allError,
            }
          )}
        >
          <div className="ui-flex ui-flex-1 ui-px-2 ui-relative">
            <DateField {...startFieldProps} id={`${props.id}-start`} />
            <span aria-hidden="true" className="ui-px-2">
              –
            </span>
            <DateField {...endFieldProps} id={`${props.id}-end`} />

            {state.value?.start !== null &&
            state.value?.end !== null &&
            props.clearable ? (
              <ClearButton
                id={props.id}
                aria-label="Clear"
                onPress={() => state.setValue(null)}
              >
                <XMarkIcon className="ui-size-4"></XMarkIcon>
              </ClearButton>
            ) : null}
          </div>
          <FieldButton
            isDisabled={props.isDisabled}
            {...buttonProps}
            id={props.id}
          >
            <CalendarIcon className="ui-h-4 ui-w-4 ui-text-gray-800"></CalendarIcon>
          </FieldButton>
        </div>
        <AnimatePresence>
          {isOpen && (
            <Popover state={state} triggerRef={ref} placement="bottom start">
              <Dialog {...dialogProps}>
                <div
                  className={cx({
                    'ui-grid ui-grid-cols-[150px_1fr]': props.withPreset,
                  })}
                >
                  {props.withPreset ? (
                    <Preset
                      presets={presetList}
                      onClick={handlePresetClick}
                      selectedPreset={selectedPreset}
                    ></Preset>
                  ) : null}

                  <RangeCalendar
                    id={props.id}
                    focusedValue={focusedDate}
                    onFocusChange={setFocusedDate}
                    multiCalendar={props.multiCalendar}
                    maxRange={props.maxRange}
                    {...calendarProps}
                  />
                </div>
              </Dialog>
            </Popover>
          )}
        </AnimatePresence>
      </div>
    </I18nProvider>
  )
}
